import { useState } from "react";
import { Heart, TrendingUp, Trophy, Award, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/useResponsive";

interface Player {
  id: string;
  name: string;
  image: string;
  club: string;
  position: string;
  votes: number;
  isLiked: boolean;
  trend: "up" | "down" | "stable";
  ranking: number;
  stats: {
    goals?: number;
    assists?: number;
    matches?: number;
  };
}

interface EnhancedPlayerCardProps {
  player: Player;
  onVote: (playerId: string) => void;
  onLike: (playerId: string) => void;
  onViewDetails: (player: Player) => void;
  compact?: boolean;
}

export const EnhancedPlayerCard = ({ 
  player, 
  onVote, 
  onLike, 
  onViewDetails,
  compact = false 
}: EnhancedPlayerCardProps) => {
  const [isVoting, setIsVoting] = useState(false);
  const { isMobile } = useResponsive();

  const handleVote = async () => {
    setIsVoting(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Animation delay
    onVote(player.id);
    setIsVoting(false);
  };

  const getTrendIcon = () => {
    switch (player.trend) {
      case "up": return <TrendingUp className="w-3 h-3 text-green-500" />;
      case "down": return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
      default: return null;
    }
  };

  const getRankingBadgeColor = () => {
    if (player.ranking <= 3) return "bg-gradient-to-r from-yellow-400 to-yellow-600";
    if (player.ranking <= 10) return "bg-gradient-to-r from-gray-400 to-gray-600";
    return "bg-gradient-to-r from-orange-400 to-orange-600";
  };

  return (
    <div className="animate-fade-in">
      <Card className={cn(
        "relative overflow-hidden group",
        "bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm",
        "border-2 border-border/50 hover:border-primary/30",
        "transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1",
        compact ? "p-3" : "p-4"
      )}>
        {/* Ranking Badge */}
        <div className={cn(
          "absolute top-2 left-2 z-10 rounded-full text-white text-xs font-bold",
          "flex items-center justify-center w-6 h-6",
          getRankingBadgeColor()
        )}>
          {player.ranking}
        </div>

        {/* Trend Indicator */}
        {getTrendIcon() && (
          <div className="absolute top-2 right-2 z-10">
            {getTrendIcon()}
          </div>
        )}

        <div className={cn(
          "flex gap-3",
          compact ? "items-center" : "flex-col items-center text-center"
        )}>
          {/* Player Image */}
          <div className="relative group/image">
            <img
              src={player.image}
              alt={player.name}
              className={cn(
                "object-cover rounded-full border-2 border-border/50",
                "group-hover:border-primary/50 transition-all duration-300 hover:scale-105",
                compact ? "w-12 h-12" : "w-20 h-20 mx-auto"
              )}
            />
            
            {/* Hover overlay for details */}
            <div
              className="absolute inset-0 bg-primary/20 rounded-full flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity cursor-pointer hover:scale-105"
              onClick={() => onViewDetails(player)}
            >
              <Eye className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className={cn("flex-1", compact ? "text-left" : "text-center")}>
            {/* Player Info */}
            <h3 className={cn(
              "font-bold text-gradient-gold line-clamp-1",
              compact ? "text-sm" : "text-base"
            )}>
              {player.name}
            </h3>
            
            <div className={cn(
              "flex gap-1 mb-2",
              compact ? "text-xs" : "text-sm justify-center"
            )}>
              <Badge variant="outline" className="text-xs">
                {player.club}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {player.position}
              </Badge>
            </div>

            {/* Stats (non-compact only) */}
            {!compact && player.stats && (
              <div className="flex justify-center gap-4 text-xs text-muted-foreground mb-3">
                {player.stats.goals && (
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    {player.stats.goals}
                  </span>
                )}
                {player.stats.assists && (
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {player.stats.assists}
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className={cn(
              "flex gap-2",
              compact ? "items-center" : "justify-center"
            )}>
              <div className="transition-transform hover:scale-95 active:scale-90">
                <Button
                  variant="outline"
                  size={compact ? "sm" : "default"}
                  onClick={handleVote}
                  disabled={isVoting}
                  className={cn(
                    "btn-golden transition-all duration-200",
                    compact ? "px-3 py-1 text-xs" : "px-4 py-2",
                    isVoting && "animate-pulse"
                  )}
                >
                  {isVoting ? (
                    <div className="animate-spin">
                      ⚽
                    </div>
                  ) : (
                    <>
                      <Trophy className={cn("mr-1", compact ? "w-3 h-3" : "w-4 h-4")} />
                      Voter
                    </>
                  )}
                </Button>
              </div>

              <div className="transition-transform hover:scale-95 active:scale-90">
                <Button
                  variant="ghost"
                  size={compact ? "sm" : "default"}
                  onClick={() => onLike(player.id)}
                  className={cn(
                    "transition-all duration-200",
                    player.isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                  )}
                >
                  <Heart
                    className={cn(
                      compact ? "w-3 h-3" : "w-4 h-4",
                      player.isLiked && "fill-current"
                    )}
                  />
                  <span className="ml-1 text-xs">{player.votes}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};