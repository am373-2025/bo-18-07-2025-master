import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NewChatModal } from "@/components/ui/new-chat-modal";
import { MessageCircle, Send, Plus, Search, MoreVertical, Camera, Smile, Users, Image, Trash2, LogOut } from "lucide-react";
import { MediaUploadModal } from "@/components/ui/media-upload-modal";
import { MembersModal } from "@/components/ui/members-modal";
import { GroupMediaModal } from "@/components/ui/group-media-modal";
import { supabase } from "@/lib/supabaseClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    name: string;
    avatar: string;
  };
}

interface Conversation {
  id: string;
  type: 'private' | 'group';
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online?: boolean;
  participants?: number;
}

export default function Chat() {
  const { user, isAuthenticated } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showGroupMediaModal, setShowGroupMediaModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Load chat messages from new unified table
  const { data: chatMessages, loading: messagesLoading } = useSupabaseTable(
    'chat_messages',
    user ? {} : undefined,
    'id, sender_id, group_id, receiver_id, content, message_type, media_url, is_read, created_at, profiles!chat_messages_sender_id_fkey(name, avatar)'
  );
  
  // Load public chat groups
  const { data: publicGroups, loading: groupsLoading } = useSupabaseTable(
    'chat_groups',
    { is_public: true },
    'id, name, description, avatar, member_count, created_at'
  );

  // Load user's group memberships
  const { data: userGroups } = useSupabaseTable(
    'chat_group_members',
    user ? { user_id: user.id } : undefined,
    'group_id, chat_groups(id, name, description, avatar, member_count)'
  );

  // Process messages into conversations
  useEffect(() => {
    if (!chatMessages || !user) return;

    const conversationMap = new Map<string, Conversation>();
    
    // Process private messages
    chatMessages
      .filter(msg => !msg.group_id && (msg.sender_id === user.id || msg.receiver_id === user.id))
      .forEach(msg => {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        
        if (otherUserId && !conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            id: otherUserId,
            type: 'private',
            name: (msg as any).profiles?.name || 'Utilisateur',
            avatar: (msg as any).profiles?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
            lastMessage: msg.content,
            timestamp: new Date(msg.created_at).toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            unread: msg.is_read ? 0 : 1,
            online: false
          });
        }
      });
    
    // Add user's groups as conversations
    if (userGroups) {
      userGroups.forEach((membership: any) => {
        const group = membership.chat_groups;
        if (group) {
          conversationMap.set(group.id, {
            id: group.id,
            type: 'group',
            name: group.name,
            avatar: group.avatar || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop',
            lastMessage: 'Groupe rejoint',
            timestamp: 'récemment',
            unread: 0,
            participants: group.member_count
          });
        }
      });
    }

    setConversations(Array.from(conversationMap.values()));
  }, [chatMessages, user, userGroups]);

  // Load public groups for discovery
  useEffect(() => {
    if (publicGroups) {
      setGroups(publicGroups.map(group => ({
        id: group.id,
        name: group.name,
        members: `${group.member_count} membres`,
        avatar: group.avatar || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop',
        description: group.description
      })));
    }
  }, [publicGroups]);

  // Load messages for selected chat
  useEffect(() => {
    if (!selectedChat || !user || !chatMessages) return;

    let filteredMessages = [];
    
    // Check if it's a group or private chat
    const isGroup = conversations.find(c => c.id === selectedChat)?.type === 'group';
    
    if (isGroup) {
      // Group messages
      filteredMessages = chatMessages.filter(msg => msg.group_id === selectedChat);
    } else {
      // Private messages
      filteredMessages = chatMessages.filter(msg => 
        !msg.group_id && (
          (msg.sender_id === user.id && msg.receiver_id === selectedChat) ||
          (msg.sender_id === selectedChat && msg.receiver_id === user.id)
        )
      );
    }

    setMessages(filteredMessages);
  }, [selectedChat, chatMessages, user, conversations]);

  const joinGroup = async (groupId: string, groupName: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour rejoindre des groupes",
        variant: "destructive"
      });
      return;
    }

    try {
      if (supabase) {
        // Check if already member
        const { data: existing } = await supabase
          .from('chat_group_members')
          .select('id')
          .eq('group_id', groupId)
          .eq('user_id', user.id)
          .single();

        if (existing) {
          toast({
            title: "Déjà membre",
            description: "Vous êtes déjà membre de ce groupe"
          });
          return;
        }

        // Join the group
        const { error } = await supabase
          .from('chat_group_members')
          .insert([{
            group_id: groupId,
            user_id: user.id,
            role: 'member'
          }]);

        if (error) throw error;

        toast({
          title: `👥 ${groupName}`,
          description: "Vous avez rejoint le groupe avec succès !"
        });

        // Refresh conversations to include new group
        window.location.reload();
      } else {
        // localStorage fallback
        const newConversation = {
          id: groupId,
          type: "group" as const,
          name: groupName,
          avatar: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop',
          lastMessage: "Vous avez rejoint le groupe",
          timestamp: "maintenant",
          unread: 0,
          participants: Math.floor(Math.random() * 1000) + 100
        };
        setConversations([newConversation, ...conversations]);
        
        toast({
          title: `👥 ${groupName}`,
          description: "Vous avez rejoint le groupe (mode démo)"
        });
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejoindre le groupe",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !user || !selectedChat) return;

    const conversation = conversations.find(c => c.id === selectedChat);
    if (!conversation) return;

    try {
      if (supabase) {
        const messageData: any = {
          sender_id: user.id,
          content: content.trim(),
          message_type: 'text',
          is_read: false
        };

        if (conversation.type === 'group') {
          messageData.group_id = selectedChat;
        } else {
          messageData.receiver_id = selectedChat;
        }

        const { data, error } = await supabase
          .from('chat_messages')
          .insert([messageData])
          .select('*, profiles!chat_messages_sender_id_fkey(name, avatar)')
          .single();

        if (error) throw error;

        // Add message to local state
        setMessages(prev => [...prev, data]);
        setMessage("");
        
        toast({
          title: "Message envoyé",
          description: "Votre message a été envoyé avec succès"
        });
      } else {
        // localStorage fallback
        const newMessage = {
          id: crypto.randomUUID(),
          sender_id: user.id,
          receiver_id: conversation.type === 'private' ? selectedChat : undefined,
          group_id: conversation.type === 'group' ? selectedChat : undefined,
          content: content.trim(),
          message_type: 'text',
          is_read: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, newMessage]);
        setMessage("");
        
        toast({
          title: "Message envoyé (mode démo)",
          description: "Votre message a été envoyé en mode local"
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
    }
  };

  if (selectedChat) {
    const chat = conversations.find(c => c.id === selectedChat);
    
    return (
      <div className="min-h-screen bg-background pb-20 flex flex-col">
        {/* Header de conversation */}
        <header className="bg-card/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
          <div className="flex items-center justify-between p-4 max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedChat(null)}
              >
                ←
              </Button>
              <Avatar className="w-10 h-10">
                <AvatarImage src={chat?.avatar} alt={chat?.name} />
                <AvatarFallback>{chat?.name?.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-sm">{chat?.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {chat?.type === "group" 
                    ? `${chat.participants} participants`
                    : "En ligne"
                  }
                </p>
              </div>
            </div>
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-md border-border/50">
                  {chat?.type === "group" && (
                    <>
                      <DropdownMenuItem onClick={() => {
                        setShowMembersModal(true);
                      }}>
                        <Users className="w-4 h-4 mr-2" />
                        Voir les membres
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setShowGroupMediaModal(true);
                      }}>
                        <Image className="w-4 h-4 mr-2" />
                        Voir les médias partagés
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setConversations(conversations.filter(c => c.id !== selectedChat));
                        setSelectedChat(null);
                        toast({
                          title: "🗑️ Groupe supprimé",
                          description: `Le groupe ${chat.name} a été supprimé`,
                          variant: "destructive"
                        });
                      }}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer le groupe
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedChat(null);
                        toast({
                          title: "👋 Groupe quitté",
                          description: `Vous avez quitté ${chat.name}`
                        });
                      }}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Quitter le groupe
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem 
                    onClick={() => {
                      setConversations(conversations.filter(c => c.id !== selectedChat));
                      setSelectedChat(null);
                      toast({
                        title: "🗑️ Chat supprimé",
                        description: "La conversation a été supprimée",
                        variant: "destructive"
                      });
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer le chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 max-w-md mx-auto w-full p-4 space-y-4 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl animate-slide-up ${
                  msg.sender_id === user?.id
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-xs opacity-70">
                    {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {msg.sender_id === user?.id && (
                    <span className="text-xs opacity-70">
                      {msg.is_read ? "✓✓" : "✓"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input de message */}
        <div className="bg-card/95 backdrop-blur-md border-t border-border/50 p-4 max-w-md mx-auto w-full">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowMediaModal(true)}>
              <Camera className="w-5 h-5" />
            </Button>
            <div className="flex-1 relative">
              <Input
                placeholder="Tapez votre message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="pr-10"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
                onClick={() => {
                  const emojis = ["😊", "👍", "❤️", "⚽", "🏆", "🔥", "💪", "😍"];
                  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                  setMessage(message + randomEmoji);
                  toast({
                    title: `${randomEmoji} Emoji ajouté !`,
                    description: "Emoji inséré dans votre message"
                  });
                }}
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>
            <Button
              size="sm"
              className="btn-golden"
              onClick={handleSendMessage}
              disabled={!message.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
        <div className="p-4 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-primary animate-float" />
              <h1 className="text-2xl font-bold text-gradient-gold">Messages</h1>
            </div>
            <Button size="sm" className="btn-golden" onClick={() => setShowNewChatModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une conversation..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) {
                  toast({
                    title: "🔍 Recherche en cours",
                    description: `Recherche de "${e.target.value}" dans vos conversations`
                  });
                }
              }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4 animate-fade-in">
        {!isAuthenticated && (
          <Card className="card-golden p-4 text-center">
            <p className="text-muted-foreground mb-4">
              Connectez-vous pour accéder à vos messages
            </p>
            <Button className="btn-golden" onClick={() => {}}>
              Se connecter
            </Button>
          </Card>
        )}

        {/* Conversations */}
        {isAuthenticated && (
          <div className="space-y-2">
            {messagesLoading && (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Chargement...</p>
              </div>
            )}
            
            {conversations.map((conversation, index) => (
              <Card
                key={conversation.id}
                className="card-golden cursor-pointer hover:scale-[1.02] transition-all duration-200 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelectedChat(conversation.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={conversation.avatar} alt={conversation.name} />
                        <AvatarFallback>{conversation.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      {conversation.type === "private" && conversation.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm truncate">
                          {conversation.name}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {conversation.timestamp}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {conversation.lastMessage}
                      </p>
                      
                      {conversation.type === "group" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {conversation.participants} participants
                        </p>
                      )}
                    </div>
                    
                    {conversation.unread > 0 && (
                      <Badge className="bg-primary text-primary-foreground">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gradient-gold">
            Groupes populaires
          </h3>
          
          <div className="grid gap-3">
            {(groups.length > 0 ? groups : [
              { id: 'demo-1', name: "🇫🇷 Supporters France", members: "2.3K membres", avatar: "https://images.unsplash.com/photo-1551038442-8e68eae1c3b9?w=100&h=100&fit=crop" },
              { id: 'demo-2', name: "⚽ Débat Football", members: "1.8K membres", avatar: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop" }
            ]).map((group, index) => (
              <Card key={index} className="card-golden">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={group.avatar} alt={group.name} />
                      <AvatarFallback>{group.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{group.name}</h4>
                      <p className="text-xs text-muted-foreground">{group.members}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="btn-golden-outline"
                      onClick={() => joinGroup(group.id, group.name)}
                    >
                      Rejoindre
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Modales */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onCreateChat={(newChat) => {
          // Nouveau chat complètement vide
          const cleanChat = {
            ...newChat,
            lastMessage: "",
            unread: 0,
            timestamp: "maintenant"
          };
          setConversations([cleanChat, ...conversations]);
          // Initialiser avec un chat vide, pas de messages existants
          setMessages([]);
        }}
      />
      
      <MediaUploadModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onUpload={(file, type) => {
          // Handle media upload to current chat
          if (selectedChat && user) {
            const mediaUrl = URL.createObjectURL(file);
            sendMessage(`${type === 'image' ? '📸' : '🎥'} ${type === 'image' ? 'Image' : 'Vidéo'} partagée`);
          }
        }}
      />
      
      <MembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        groupName={selectedChat ? conversations.find(c => c.id === selectedChat)?.name || "" : ""}
        memberCount={selectedChat ? conversations.find(c => c.id === selectedChat)?.participants || 0 : 0}
      />
      
      <GroupMediaModal
        isOpen={showGroupMediaModal}
        onClose={() => setShowGroupMediaModal(false)}
        groupName={selectedChat ? conversations.find(c => c.id === selectedChat)?.name || "" : ""}
      />
    </div>
  );
}