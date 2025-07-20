import { useState, useEffect } from "react";
import { MessageCircle, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { NewChatModal } from "@/components/ui/new-chat-modal";
import { MediaUploadModal } from "@/components/ui/media-upload-modal";
import { MembersModal } from "@/components/ui/members-modal";
import { GroupMediaModal } from "@/components/ui/group-media-modal";
import { supabase } from "@/lib/supabaseClient";

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

        window.location.reload();
      } else {
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

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
    }
  };

  if (selectedChat) {
    const chat = conversations.find(c => c.id === selectedChat);
    
    return (
      <div className="min-h-screen bg-background pb-20 flex flex-col">
        <ChatHeader
          chat={chat}
          onBack={() => setSelectedChat(null)}
          onShowMembers={() => setShowMembersModal(true)}
          onShowMedia={() => setShowGroupMediaModal(true)}
          onDeleteChat={() => {
            setConversations(conversations.filter(c => c.id !== selectedChat));
            setSelectedChat(null);
            toast({
              title: "🗑️ Chat supprimé",
              description: "La conversation a été supprimée",
              variant: "destructive"
            });
          }}
          onLeaveGroup={() => {
            setSelectedChat(null);
            toast({
              title: "👋 Groupe quitté",
              description: `Vous avez quitté ${chat?.name}`
            });
          }}
        />

        <MessageList messages={messages} currentUserId={user?.id || ''} />

        <MessageInput
          message={message}
          setMessage={setMessage}
          onSendMessage={handleSendMessage}
          onShowMedia={() => setShowMediaModal(true)}
        />
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
        <ConversationList
          conversations={conversations}
          groups={groups}
          loading={messagesLoading}
          isAuthenticated={isAuthenticated}
          onSelectChat={setSelectedChat}
          onJoinGroup={joinGroup}
        />
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