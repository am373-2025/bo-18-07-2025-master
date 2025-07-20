import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users, Search, Plus, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { debounce } from "@/lib/utils";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChat: (chat: any) => void;
}

interface RealUser {
  id: string;
  name: string;
  username?: string;
  avatar: string;
  is_online?: boolean;
  last_seen?: string;
}

export const NewChatModal = ({ isOpen, onClose, onCreateChat }: NewChatModalProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("private");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [realUsers, setRealUsers] = useState<RealUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const { toast } = useToast();

  // Recherche d'utilisateurs réels avec debounce
  const searchUsers = debounce(async (query: string) => {
    if (!query.trim() || !supabase) {
      setRealUsers([]);
      return;
    }

    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, username, avatar, last_seen')
        .neq('id', user?.id) // Exclure l'utilisateur actuel
        .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;

      const usersWithStatus = data.map(profile => ({
        ...profile,
        is_online: profile.last_seen ? 
          (new Date().getTime() - new Date(profile.last_seen).getTime()) < 5 * 60 * 1000 : false
      }));

      setRealUsers(usersWithStatus);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Erreur de recherche",
        description: "Impossible de rechercher les utilisateurs",
        variant: "destructive"
      });
    } finally {
      setSearchLoading(false);
    }
  }, 300);

  useEffect(() => {
    searchUsers(searchQuery);
  }, [searchQuery]);

  const handleUserSelect = (userId: string) => {
    if (activeTab === "private") {
      setSelectedUsers([userId]);
    } else {
      setSelectedUsers(prev =>
        prev.includes(userId)
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      );
    }
  };

  const handleCreatePrivateChat = async () => {
    if (selectedUsers.length !== 1 || !user) return;

    setCreateLoading(true);
    try {
      const selectedUser = realUsers.find(u => u.id === selectedUsers[0]);
      if (!selectedUser) return;

      const newChat = {
        id: selectedUser.id,
        type: "private",
        name: selectedUser.name,
        username: selectedUser.username,
        avatar: selectedUser.avatar,
        lastMessage: "",
        timestamp: "maintenant",
        unread: 0,
        online: selectedUser.is_online
      } as const;

      onCreateChat(newChat);
      resetForm();
      onClose();
      
      toast({
        title: "Conversation créée !",
        description: `Nouvelle conversation avec ${selectedUser.name}`
      });
    } catch (error) {
      console.error('Error creating private chat:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation",
        variant: "destructive"
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 2 || !user) return;

    setCreateLoading(true);
    try {
      if (supabase) {
        // Créer le groupe
        const { data: groupData, error: groupError } = await supabase
          .from('chat_groups')
          .insert([{
            name: groupName.trim(),
            description: groupDescription.trim() || null,
            created_by: user.id,
            is_public: false,
            avatar: `https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop&id=${Date.now()}`
          }])
          .select()
          .single();

        if (groupError) throw groupError;

        // Ajouter les membres (créateur + sélectionnés)
        const membersToAdd = [user.id, ...selectedUsers].map(userId => ({
          group_id: groupData.id,
          user_id: userId,
          role: userId === user.id ? 'admin' : 'member'
        }));

        const { error: membersError } = await supabase
          .from('chat_group_members')
          .insert(membersToAdd);

        if (membersError) throw membersError;

        const newChat = {
          id: groupData.id,
          type: "group",
          name: groupData.name,
          avatar: groupData.avatar,
          lastMessage: "",
          timestamp: "maintenant",
          unread: 0,
          participants: selectedUsers.length + 1,
          description: groupData.description
        } as const;

        onCreateChat(newChat);
        resetForm();
        onClose();
        
        toast({
          title: "Groupe créé !",
          description: `Nouveau groupe "${groupName}" avec ${selectedUsers.length + 1} membres`
        });
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le groupe",
        variant: "destructive"
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const resetForm = () => {
    setSearchQuery("");
    setSelectedUsers([]);
    setGroupName("");
    setGroupDescription("");
    setActiveTab("private");
    setRealUsers([]);
  };

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return "Jamais vu";
    const diff = new Date().getTime() - new Date(lastSeen).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `il y a ${days}j`;
    if (hours > 0) return `il y a ${hours}h`;
    if (minutes > 0) return `il y a ${minutes}min`;
    return "En ligne";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-gradient-gold flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nouveau Chat
          </DialogTitle>
          <DialogDescription>
            Créez une nouvelle conversation privée ou un groupe
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="private" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Privée
            </TabsTrigger>
            <TabsTrigger value="group" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Groupe
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="private" className="flex-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un utilisateur par nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin" />
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 max-h-64">
              {searchQuery.trim() === '' ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Tapez pour rechercher des utilisateurs</p>
                </div>
              ) : realUsers.length === 0 && !searchLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Aucun utilisateur trouvé</p>
                </div>
              ) : (
                realUsers.map(user => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUsers.includes(user.id)
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleUserSelect(user.id)}
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      {user.is_online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{user.name}</h3>
                      {user.username && (
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatLastSeen(user.last_seen)}
                      </p>
                    </div>
                    
                    {selectedUsers.includes(user.id) && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                ))
              )}
            </div>
            
            <Button
              className="w-full btn-golden"
              onClick={handleCreatePrivateChat}
              disabled={selectedUsers.length !== 1 || createLoading}
            >
              {createLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Créer la conversation
            </Button>
          </TabsContent>
          
          <TabsContent value="group" className="flex-1 space-y-4">
            <div className="space-y-3">
              <Input
                placeholder="Nom du groupe..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              
              <Textarea
                placeholder="Description du groupe (optionnel)..."
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                className="min-h-[60px]"
              />
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Ajouter des membres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin" />
              )}
            </div>
            
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(userId => {
                  const user = realUsers.find(u => u.id === userId);
                  return user ? (
                    <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                      <Avatar className="w-4 h-4">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      {user.name}
                      <button
                        onClick={() => handleUserSelect(userId)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto space-y-2 max-h-48">
              {realUsers.map(user => (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedUsers.includes(user.id)
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleUserSelect(user.id)}
                >
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    {user.is_online && (
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-background" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{user.name}</h4>
                    {user.username && (
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    )}
                  </div>
                  
                  {selectedUsers.includes(user.id) && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
            
            <Button
              className="w-full btn-golden"
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedUsers.length < 2 || createLoading}
            >
              {createLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Créer le groupe ({selectedUsers.length + 1} membres)
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};