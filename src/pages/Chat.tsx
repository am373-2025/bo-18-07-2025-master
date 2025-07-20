import { useState, useEffect, useRef } from "react";
import { MessageCircle, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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
import { supabase } from "@/lib/supabase";

interface Message {
  id: string;
  sender_id: string;
  receiver_id?: string;
  group_id?: string;
  content: string;
  message_type: 'text' | 'image' | 'video' | 'file';
  media_url?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender?: {
    name: string;
    avatar: string;
  };
}

interface Conversation {
  id: string;
  type: 'private' | 'group';
  name: string;
  username?: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online?: boolean;
  participants?: number;
  description?: string;
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
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const realtimeChannelRef = useRef<any>(null);
  const { toast } = useToast();

  // Charger les conversations au démarrage
  useEffect(() => {
    if (isAuthenticated && user) {
      loadConversations();
      loadPublicGroups();
      setupRealtimeSubscription();
    }

    return () => {
      if (realtimeChannelRef.current) {
        supabase?.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [isAuthenticated, user]);

  // Scroll automatique vers les nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const setupRealtimeSubscription = () => {
    if (!supabase || !user) return;

    realtimeChannelRef.current = supabase
      .channel('chat_messages_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Ajouter le message s'il concerne le chat sélectionné
          if (selectedChat) {
            const isRelevant = 
              (newMessage.group_id === selectedChat) ||
              (!newMessage.group_id && (
                (newMessage.sender_id === selectedChat && newMessage.receiver_id === user.id) ||
                (newMessage.sender_id === user.id && newMessage.receiver_id === selectedChat)
              ));

            if (isRelevant) {
              setMessages(prev => [...prev, newMessage]);
              
              // Marquer comme lu si c'est le chat actuel et ce n'est pas notre message
              if (newMessage.sender_id !== user.id) {
                markMessageAsRead(newMessage.id);
              }
            }
          }

          // Mettre à jour la liste des conversations
          loadConversations();
        }
      )
      .subscribe();
  };

  const loadConversations = async () => {
    if (!supabase || !user) return;

    try {
      // Charger les messages privés
      const { data: privateMessages } = await supabase
        .from('chat_messages')
        .select(`
          id, sender_id, receiver_id, content, created_at, is_read,
          sender:profiles!chat_messages_sender_id_fkey(name, avatar, username),
          receiver:profiles!chat_messages_receiver_id_fkey(name, avatar, username)
        `)
        .is('group_id', null)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      // Charger les groupes de l'utilisateur
      const { data: userGroups } = await supabase
        .from('chat_group_members')
        .select(`
          group_id,
          chat_groups(id, name, description, avatar, member_count, created_at)
        `)
        .eq('user_id', user.id);

      const conversationMap = new Map<string, Conversation>();

      // Traiter les messages privés
      if (privateMessages) {
        privateMessages.forEach(msg => {
          const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
          const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;
          
          if (otherUserId && otherUser && !conversationMap.has(otherUserId)) {
            conversationMap.set(otherUserId, {
              id: otherUserId,
              type: 'private',
              name: otherUser.name,
              username: otherUser.username,
              avatar: otherUser.avatar,
              lastMessage: msg.content,
              timestamp: new Date(msg.created_at).toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              unread: msg.sender_id !== user.id && !msg.is_read ? 1 : 0,
              online: false
            });
          }
        });
      }

      // Ajouter les groupes
      if (userGroups) {
        userGroups.forEach((membership: any) => {
          const group = membership.chat_groups;
          if (group) {
            conversationMap.set(group.id, {
              id: group.id,
              type: 'group',
              name: group.name,
              avatar: group.avatar || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop',
              lastMessage: 'Groupe',
              timestamp: 'récemment',
              unread: 0,
              participants: group.member_count,
              description: group.description
            });
          }
        });
      }

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadPublicGroups = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('chat_groups')
        .select('id, name, description, avatar, member_count')
        .eq('is_public', true)
        .limit(10);

      if (error) throw error;

      setGroups(data.map(group => ({
        id: group.id,
        name: group.name,
        members: `${group.member_count} membres`,
        avatar: group.avatar || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop',
        description: group.description
      })));
    } catch (error) {
      console.error('Error loading public groups:', error);
    }
  };

  const loadMessages = async (chatId: string, chatType: 'private' | 'group') => {
    if (!supabase || !user) return;

    try {
      let query = supabase
        .from('chat_messages')
        .select(`
          id, sender_id, receiver_id, group_id, content, message_type, media_url, 
          is_read, created_at, updated_at,
          sender:profiles!chat_messages_sender_id_fkey(name, avatar)
        `)
        .order('created_at', { ascending: true });

      if (chatType === 'group') {
        query = query.eq('group_id', chatId);
      } else {
        query = query
          .is('group_id', null)
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${chatId}),and(sender_id.eq.${chatId},receiver_id.eq.${user.id})`);
      }

      const { data, error } = await query;
      if (error) throw error;

      setMessages(data || []);

      // Marquer les messages reçus comme lus
      const unreadMessages = data?.filter(msg => 
        msg.sender_id !== user.id && !msg.is_read
      ) || [];

      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(msg => msg.id);
        await supabase
          .from('chat_messages')
          .update({ is_read: true })
          .in('id', messageIds);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    if (!supabase) return;

    try {
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendMessage = async (content: string, mediaUrl?: string, messageType: 'text' | 'image' | 'video' | 'file' = 'text') => {
    if ((!content.trim() && !mediaUrl) || !user || !selectedChat) return;

    const conversation = conversations.find(c => c.id === selectedChat);
    if (!conversation) return;

    try {
      if (supabase) {
        const messageData: any = {
          sender_id: user.id,
          content: content.trim() || '',
          message_type: messageType,
          media_url: mediaUrl,
          is_read: false,
          created_at: new Date().toISOString()
        };

        if (conversation.type === 'group') {
          messageData.group_id = selectedChat;
        } else {
          messageData.receiver_id = selectedChat;
        }

        const { data, error } = await supabase
          .from('chat_messages')
          .insert([messageData])
          .select(`
            id, sender_id, receiver_id, group_id, content, message_type, media_url,
            is_read, created_at,
            sender:profiles!chat_messages_sender_id_fkey(name, avatar)
          `)
          .single();

        if (error) throw error;

        // Update profile last_seen
        await supabase
          .from('profiles')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', user.id);

        setMessage("");
        
        toast({
          title: "Message envoyé",
          description: messageType === 'text' ? "Message envoyé avec succès" : "Média partagé avec succès"
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

  const uploadMedia = async (file: File): Promise<string | null> => {
    if (!supabase || !user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'envoyer le fichier",
        variant: "destructive"
      });
      return null;
    }
  };

  const joinGroup = async (groupId: string, groupName: string) => {
    if (!user || !supabase) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour rejoindre des groupes",
        variant: "destructive"
      });
      return;
    }

    try {
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

      loadConversations();
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

  const handleMediaUpload = async (file: File, type: 'image' | 'video') => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "Fichier trop volumineux",
        description: "Le fichier ne doit pas dépasser 10MB",
        variant: "destructive"
      });
      return;
    }

    const mediaUrl = await uploadMedia(file);
    if (mediaUrl) {
      await sendMessage('', mediaUrl, type);
    }
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId);
    const conversation = conversations.find(c => c.id === chatId);
    if (conversation) {
      loadMessages(chatId, conversation.type);
    }
  };

  const handleCreateChat = (newChat: Conversation) => {
    setConversations(prev => [newChat, ...prev]);
    setSelectedChat(newChat.id);
    setMessages([]);
    loadMessages(newChat.id, newChat.type);
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
        <div ref={messagesEndRef} />

        <MessageInput
          message={message}
          setMessage={setMessage}
          onSendMessage={handleSendMessage}
          onShowMedia={() => setShowMediaModal(true)}
        />

        {/* Modales pour le chat actuel */}
        <MediaUploadModal
          isOpen={showMediaModal}
          onClose={() => setShowMediaModal(false)}
          onUpload={handleMediaUpload}
        />
        
        <MembersModal
          isOpen={showMembersModal}
          onClose={() => setShowMembersModal(false)}
          groupName={chat?.name || ""}
          memberCount={chat?.participants || 0}
        />
        
        <GroupMediaModal
          isOpen={showGroupMediaModal}
          onClose={() => setShowGroupMediaModal(false)}
          groupName={chat?.name || ""}
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
            <Button 
              size="sm" 
              className="btn-golden" 
              onClick={() => setShowNewChatModal(true)}
            >
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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4 animate-fade-in">
        <ConversationList
          conversations={conversations.filter(c => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          groups={groups}
          loading={loading}
          isAuthenticated={isAuthenticated}
          onSelectChat={handleSelectChat}
          onJoinGroup={joinGroup}
        />
      </main>

      {/* Modal nouveau chat */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onCreateChat={(newChat) => {
          setConversations([newChat, ...conversations]);
          setSelectedChat(newChat.id);
          setMessages([]);
        }}
      />
    </div>
  );
}