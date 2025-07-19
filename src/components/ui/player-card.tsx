import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Heart, Vote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface Player {
  id: string;
  name: string;
  position: string;
  club: string;
  photo: string;
  votes: number;
  isLiked?: boolean;
  slug?: string;
}

interface PlayerCardProps {
  player: Player;
  onViewDetails: (player: Player) => void;
  onVote: (playerId: string) => void;
  onLike: (playerId: string) => void;
}

export const PlayerCard = ({ player, onViewDetails, onVote, onLike }: PlayerCardProps) => {
  const navigate = useNavigate();
  const [isVoting, setIsVoting] = useState(false);
  const [isLiked, setIsLiked] = useState(player.isLiked || false);

  useEffect(() => {
    setIsLiked(player.isLiked || false);
  }, [player.isLiked]);

  const handleVote = async () => {
    setIsVoting(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Animation delay
    onVote(player.id);
    setIsVoting(false);
  };

  const handleLike = async () => {
    // Using localStorage instead of Supabase
    const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
    if (isLiked) {
      // Supprimer des favoris
      const updated = favorites.filter((fav: any) => fav.player_id !== player.id);
      localStorage.setItem('userFavorites', JSON.stringify(updated));
      setIsLiked(false);
    } else {
      // Vérifier si déjà en favori
      const existing = favorites.find((fav: any) => fav.player_id === player.id);
      if (!existing) {
        favorites.push({ user_id: 'user-1', player_id: player.id });
        localStorage.setItem('userFavorites', JSON.stringify(favorites));
        setIsLiked(true);
      } else {
        // Déjà en favori
        alert("Ce joueur est déjà dans vos favoris.");
      }
    }
    onLike(player.id);
  };

  return (
    <Card className="card-golden group cursor-pointer overflow-hidden">
      <CardContent className="p-0">
        {/* Photo du joueur */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={player.photo} 
            alt={player.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Badge position */}
          <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground">
            {player.position}
          </Badge>

          {/* Votes count */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
            <Vote className="w-3 h-3 text-primary" />
            <span className="text-xs text-white font-medium">{player.votes}</span>
          </div>
        </div>

        {/* Informations du joueur */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-bold text-lg text-gradient-gold leading-tight">
              {player.name}
            </h3>
            <p className="text-sm text-muted-foreground">{player.club}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 btn-golden-outline"
              onClick={(e) => {
                e.stopPropagation();
                if (player.slug) {
                  navigate(`/player/${player.slug}`);
                } else {
                  onViewDetails(player);
                }
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              Voir fiche
            </Button>
            
            <Button
              size="sm"
              className={`flex-1 btn-golden relative overflow-hidden ${
                isVoting ? 'animate-pulse' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleVote();
              }}
              disabled={isVoting}
            >
              {isVoting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Vote...
                </div>
              ) : (
                <>
                  <Vote className="w-4 h-4 mr-2" />
                  Voter
                </>
              )}
              
              {isVoting && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-[shimmer_1s_ease-in-out]" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};