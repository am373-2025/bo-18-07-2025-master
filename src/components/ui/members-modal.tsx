import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Crown, Shield, User } from "lucide-react";

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  memberCount: number;
}

// Données factices des membres
const membersData = [
  {
    id: "1",
    name: "Sophie Durand",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop",
    role: "admin",
    lastSeen: "En ligne",
    joinedDate: "Mars 2024"
  },
  {
    id: "2", 
    name: "Alex Martin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    role: "moderator",
    lastSeen: "Il y a 5 min",
    joinedDate: "Avril 2024"
  },
  {
    id: "3",
    name: "Marco Silva",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    role: "member",
    lastSeen: "Il y a 1h",
    joinedDate: "Mai 2024"
  },
  {
    id: "4",
    name: "Emma Garcia", 
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    role: "member",
    lastSeen: "Il y a 2h",
    joinedDate: "Juin 2024"
  },
  {
    id: "5",
    name: "Lucas Moreau",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    role: "member",
    lastSeen: "Hier",
    joinedDate: "Juillet 2024"
  }
];

export const MembersModal = ({ isOpen, onClose, groupName, memberCount }: MembersModalProps) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "moderator":
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "moderator":
        return "Modérateur";
      default:
        return "Membre";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gradient-gold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Membres du groupe
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {memberCount} membres dans {groupName}
          </p>
        </DialogHeader>

        <div className="space-y-3">
          {membersData.map((member) => (
            <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
              <Avatar className="w-12 h-12">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm truncate">{member.name}</h4>
                  {getRoleIcon(member.role)}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {getRoleLabel(member.role)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{member.lastSeen}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Membre depuis {member.joinedDate}
                </p>
              </div>
            </div>
          ))}
          
          {/* Afficher qu'il y a plus de membres */}
          {memberCount > membersData.length && (
            <div className="text-center p-4 border border-dashed border-border/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Et {memberCount - membersData.length} autres membres...
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Voir tous les membres
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};