import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Users, Image, Trash2, LogOut, ArrowLeft } from "lucide-react";

interface ChatHeaderProps {
  chat: {
    id: string;
    type: 'private' | 'group';
    name: string;
    avatar: string;
    participants?: number;
  } | null;
  onBack: () => void;
  onShowMembers: () => void;
  onShowMedia: () => void;
  onDeleteChat: () => void;
  onLeaveGroup: () => void;
}

export const ChatHeader = ({
  chat,
  onBack,
  onShowMembers,
  onShowMedia,
  onDeleteChat,
  onLeaveGroup
}: ChatHeaderProps) => {
  if (!chat) return null;

  return (
    <header className="bg-card/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
      <div className="flex items-center justify-between p-4 max-w-md mx-auto">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={onBack}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={chat.avatar} alt={chat.name} />
            <AvatarFallback>{chat.name?.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">{chat.name}</h2>
            <p className="text-xs text-muted-foreground">
              {chat.type === "group" 
                ? `${chat.participants} participants`
                : "En ligne"
              }
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="flex-shrink-0">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-md border-border/50">
            {chat.type === "group" && (
              <>
                <DropdownMenuItem onClick={onShowMembers}>
                  <Users className="w-4 h-4 mr-2" />
                  Voir les membres
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShowMedia}>
                  <Image className="w-4 h-4 mr-2" />
                  Médias partagés
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLeaveGroup}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Quitter le groupe
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={onDeleteChat} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer le chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};