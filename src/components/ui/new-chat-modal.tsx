import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users, Search, Plus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChat: (chat: any) => void;
}

const mockUsers = [
  {
    id: "1",
    name: "Sophie Martin",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop",
    online: true,
    lastSeen: "En ligne"
  },
  {
    id: "2", 
    name: "Alex Dubois",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    online: false,
    lastSeen: "il y a 2h"
  },
  {
    id: "3",
    name: "Marco Rodriguez",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    online: true,
    lastSeen: "En ligne"
  },
  {
    id: "4",
    name: "Emma Durand",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    online: false,
    lastSeen: "il y a 5h"
  }
];

export const NewChatModal = ({ isOpen, onClose, onCreateChat }: NewChatModalProps) => {
  const [activeTab, setActiveTab] = useState("private");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const { toast } = useToast();

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleCreatePrivateChat = () => {
    if (selectedUsers.length === 1) {
      const user = mockUsers.find(u => u.id === selectedUsers[0]);
      if (user) {
        const newChat = {
          id: Date.now().toString(),
          type: "private",
          name: user.name,
          avatar: user.avatar,
          lastMessage: "",
          timestamp: "maintenant",
          unread: 0,
          online: user.online
        };
        onCreateChat(newChat);
        resetForm();
        onClose();
        toast({
          title: "Conversation créée !",
          description: `Nouvelle conversation avec ${user.name}`
        });
      }
    }
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedUsers.length >= 2) {
      const newChat = {
        id: Date.now().toString(),
        type: "group",
        name: groupName,
        avatar: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop",
        lastMessage: "",
        timestamp: "maintenant",
        unread: 0,
        participants: selectedUsers.length + 1, // +1 for current user
        description: groupDescription
      };
      onCreateChat(newChat);
      resetForm();
      onClose();
      toast({
        title: "Groupe créé !",
        description: `Nouveau groupe "${groupName}" avec ${selectedUsers.length + 1} membres`
      });
    }
  };

  const resetForm = () => {
    setSearchQuery("");
    setSelectedUsers([]);
    setGroupName("");
    setGroupDescription("");
    setActiveTab("private");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-hidden flex flex-col">
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
                placeholder="Rechercher un utilisateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 max-h-64">
              {filteredUsers.map(user => (
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
                    {user.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{user.name}</h3>
                    <p className="text-xs text-muted-foreground">{user.lastSeen}</p>
                  </div>
                  
                  {selectedUsers.includes(user.id) && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
              ))}
            </div>
            
            <Button
              className="w-full btn-golden"
              onClick={handleCreatePrivateChat}
              disabled={selectedUsers.length !== 1}
            >
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
            </div>
            
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(userId => {
                  const user = mockUsers.find(u => u.id === userId);
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
              {filteredUsers.map(user => (
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
                    {user.online && (
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-background" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{user.name}</h4>
                    <p className="text-xs text-muted-foreground">{user.lastSeen}</p>
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
              disabled={!groupName.trim() || selectedUsers.length < 2}
            >
              Créer le groupe ({selectedUsers.length + 1} membres)
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};