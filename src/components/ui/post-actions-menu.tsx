import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit3, Flag, Heart, Bookmark, Trash2, CheckCircle2, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PostActionsMenuProps {
  postId: string;
  isOwnPost: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onFavorite?: () => void;
  onReport?: () => void;
  onShare?: () => void;
  isFavorited?: boolean;
  isReported?: boolean;
}

export const PostActionsMenu = ({ 
  postId, 
  isOwnPost, 
  onEdit, 
  onDelete,
  onFavorite, 
  onReport,
  onShare,
  isFavorited = false,
  isReported = false
}: PostActionsMenuProps) => {
  const { toast } = useToast();

  const handleEdit = () => {
    onEdit?.();
    toast({
      title: "Modification",
      description: "Mode édition activé pour ce post"
    });
  };

  const handleDelete = () => {
    onDelete?.();
    toast({
      title: "Suppression",
      description: "Le post a été supprimé",
      variant: "destructive"
    });
  };

  const handleFavorite = () => {
    onFavorite?.();
    toast({
      title: isFavorited ? "Retiré des favoris" : "Ajouté aux favoris",
      description: isFavorited ? "Post retiré de vos favoris" : "Post ajouté à vos favoris"
    });
  };

  const handleReport = () => {
    onReport?.();
    toast({
      title: "Signalement",
      description: "Ce post a été signalé aux modérateurs"
    });
  };

  const handleShare = () => {
    onShare?.();
    toast({
      title: "Partage",
      description: "Options de partage ouvertes"
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-md border-border/50">
        {isOwnPost && (
          <>
            <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
              <Edit3 className="w-4 h-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleFavorite} className="cursor-pointer">
          {isFavorited ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
              Retiré des favoris
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4 mr-2" />
              Ajouter aux favoris
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
          <Share2 className="w-4 h-4 mr-2" />
          Partager
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleReport} className="cursor-pointer text-destructive">
          <Flag className={`w-4 h-4 mr-2 ${isReported ? 'text-red-500' : ''}`} />
          {isReported ? 'Déjà signalé' : 'Signaler'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};