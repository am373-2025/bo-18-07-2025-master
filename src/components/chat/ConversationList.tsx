import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";

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

interface ConversationListProps {
  conversations: Conversation[];
  groups: Array<{
    id: string;
    name: string;
    members: string;
    avatar: string;
    description?: string;
  }>;
  loading: boolean;
  isAuthenticated: boolean;
  onSelectChat: (chatId: string) => void;
  onJoinGroup: (groupId: string, groupName: string) => void;
}

export const ConversationList = ({
  conversations,
  groups,
  loading,
  isAuthenticated,
  onSelectChat,
  onJoinGroup
}: ConversationListProps) => {
  if (!isAuthenticated) {
    return (
      <Card className="card-golden p-4 text-center">
        <p className="text-muted-foreground mb-4">
          Connectez-vous pour accéder à vos messages
        </p>
        <Button className="btn-golden">
          Se connecter
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Conversations */}
      <div className="space-y-2">
        {loading && (
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
            onClick={() => onSelectChat(conversation.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
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
                    <span className="text-xs text-muted-foreground flex-shrink-0">
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
                  <Badge className="bg-primary text-primary-foreground flex-shrink-0">
                    {conversation.unread}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Groupes populaires */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gradient-gold">
          Groupes populaires
        </h3>
        
        <div className="grid gap-3">
          {(groups.length > 0 ? groups : [
            { 
              id: 'demo-1', 
              name: "🇫🇷 Supporters France", 
              members: "2.3K membres", 
              avatar: "https://images.unsplash.com/photo-1551038442-8e68eae1c3b9?w=100&h=100&fit=crop" 
            },
            { 
              id: 'demo-2', 
              name: "⚽ Débat Football", 
              members: "1.8K membres", 
              avatar: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop" 
            }
          ]).map((group, index) => (
            <Card key={group.id} className="card-golden">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={group.avatar} alt={group.name} />
                    <AvatarFallback>{group.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{group.name}</h4>
                    <p className="text-xs text-muted-foreground">{group.members}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="btn-golden-outline flex-shrink-0"
                    onClick={() => onJoinGroup(group.id, group.name)}
                  >
                    Rejoindre
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};