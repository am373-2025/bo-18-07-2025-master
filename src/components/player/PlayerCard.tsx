import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Vote, Eye, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlayerActions } from "@/hooks/usePlayerActions";
import { cn } from "@/lib/utils";
import type { Player } from "@/types/database";

interface PlayerCardProps {
  player: Player;
  variant?: "default" | "compact" | "featured";
  showActions?: boolean;
  onViewDetails?: (player: Player) => void;
  className?: string;
}

export function PlayerCard({ 
  player, 
  variant = "default", 
  showActions = true,
  onViewDetails,
  className 
}: PlayerCardProps) {
  const navigate = useNavigate();
  const { voteForPlayer, toggleFavorite } = usePlayerActions();
  const [isVoting, setIsVoting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVoting(true);
    await voteForPlayer(player.id, player.name);
    setIsVoting(false);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiking(true);
    await toggleFavorite(player.id, player.name);
    setIsLiking(false);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(player);
    } else if (player.slug) {
      navigate(`/player/${player.slug}`);
    }
  };

  const getTrendIcon = () => {
    if (!player.trend) return null;
    return player.trend === 'up' ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : player.trend === 'down' ? (
      <TrendingDown className="w-4 h-4 text-red-500" />
    ) : null;
  };

  const cardVariants = {
    default: "card-golden group cursor-pointer hover:scale-[1.02] transition-all duration-300",
    compact: "bg-card/50 border border-border/50 rounded-lg hover:bg-card transition-colors",
    featured: "card-golden relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:to-accent/5"
  };

  if (variant === "compact") {
    return (
      <div className={cn(cardVariants.compact, className)}>
        <div className="flex items-center gap-3 p-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={player.photo} alt={player.name} />
            <AvatarFallback>{player.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate">{player.name}</h4>
            <p className="text-sm text-muted-foreground truncate">{player.club}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">{player.position}</Badge>
              {player.ranking && (
                <span className="text-xs text-muted-foreground">#{player.ranking}</span>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Vote className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{player.votes}</span>
            </div>
            {getTrendIcon()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(cardVariants[variant], className)}>
      <CardContent className="p-0">
        {/* Image du joueur */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={player.photo} 
            alt={player.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-primary/90 text-primary-foreground text-xs">
              {player.position}
            </Badge>
            {player.ranking && (
              <Badge variant="secondary" className="text-xs">
                #{player.ranking}
              </Badge>
            )}
          </div>
          
          {/* Trend et votes */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {getTrendIcon()}
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
              <Vote className="w-3 h-3 text-primary" />
              <span className="text-xs text-white font-medium">{player.votes}</span>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-bold text-lg text-gradient-gold leading-tight">
              {player.name}
            </h3>
            <p className="text-sm text-muted-foreground">{player.club}</p>
            {player.country && player.age && (
              <p className="text-xs text-muted-foreground mt-1">
                {player.country} • {player.age} ans
              </p>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 btn-golden-outline"
                onClick={handleViewDetails}
              >
                <Eye className="w-4 h-4 mr-2" />
                Voir fiche
              </Button>
              
              <Button
                size="sm"
                className={cn(
                  "flex-1 relative overflow-hidden",
                  isVoting ? "btn-golden animate-pulse" : "btn-golden"
                )}
                onClick={handleVote}
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
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "hover:bg-red-500/10",
                  isLiking && "animate-pulse"
                )}
                onClick={handleLike}
                disabled={isLiking}
              >
                <Heart className={cn(
                  "w-4 h-4",
                  isLiking ? "text-red-500 animate-pulse" : "text-muted-foreground hover:text-red-500"
                )} />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}