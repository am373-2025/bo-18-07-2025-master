import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Target, 
  Users, 
  Calendar, 
  Star, 
  Heart,
  Vote,
  X
} from "lucide-react";

interface Player {
  id: string;
  name: string;
  position: string;
  club: string;
  photo: string;
  votes: number;
  isLiked?: boolean;
}

interface PlayerDetailsModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onVote: (playerId: string) => void;
  onLike: (playerId: string) => void;
}

export const PlayerDetailsModal = ({ 
  player, 
  isOpen, 
  onClose, 
  onVote, 
  onLike 
}: PlayerDetailsModalProps) => {
  const [isVoting, setIsVoting] = useState(false);

  if (!player) return null;

  // Données simulées pour les stats
  const playerStats = {
    goals: 28,
    assists: 12,
    matches: 34,
    rating: 8.7,
    trophies: ["Ligue 1", "Champions League"],
    whyFavorite: "Performances exceptionnelles cette saison avec des statistiques impressionnantes et une constance remarquable dans les grands matchs."
  };

  const handleVote = async () => {
    setIsVoting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onVote(player.id);
    setIsVoting(false);
  };

  const handleLike = () => {
    onLike(player.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0 bg-background border-border">
        <DialogTitle className="sr-only">
          Détails du joueur {player.name}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Détails complets du joueur sélectionné
        </DialogDescription>
        {/* Header avec photo */}
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden">
            <img 
              src={player.photo} 
              alt={player.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
          
          {/* Bouton fermer */}
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/60"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Infos principales */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {player.name}
                </h2>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/90 text-primary-foreground">
                    {player.position}
                  </Badge>
                  <span className="text-white/80 text-sm">{player.club}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {/* Like button removed */}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Tabs */}
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="stats" className="text-xs">
                Statistiques
              </TabsTrigger>
              <TabsTrigger value="info" className="text-xs">
                Informations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="space-y-4 mt-6">
              {/* Stats de la saison */}
              <div>
                <h3 className="font-semibold text-gradient-gold mb-3">
                  Saison 2024-2025
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="card-golden">
                    <CardContent className="p-3 text-center">
                      <Target className="w-6 h-6 text-primary mx-auto mb-2" />
                      <div className="text-xl font-bold text-gradient-gold">
                        {playerStats.goals}
                      </div>
                      <div className="text-xs text-muted-foreground">Buts</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="card-golden">
                    <CardContent className="p-3 text-center">
                      <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                      <div className="text-xl font-bold text-gradient-gold">
                        {playerStats.assists}
                      </div>
                      <div className="text-xs text-muted-foreground">Passes</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="card-golden">
                    <CardContent className="p-3 text-center">
                      <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
                      <div className="text-xl font-bold text-gradient-gold">
                        {playerStats.matches}
                      </div>
                      <div className="text-xs text-muted-foreground">Matchs</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="card-golden">
                    <CardContent className="p-3 text-center">
                      <Star className="w-6 h-6 text-primary mx-auto mb-2" />
                      <div className="text-xl font-bold text-gradient-gold">
                        {playerStats.rating}
                      </div>
                      <div className="text-xs text-muted-foreground">Note</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Trophées */}
              <div>
                <h4 className="font-medium mb-2">Trophées cette saison</h4>
                <div className="flex flex-wrap gap-2">
                  {playerStats.trophies.map((trophy, index) => (
                    <Badge key={index} variant="outline" className="btn-golden-outline">
                      <Trophy className="w-3 h-3 mr-1" />
                      {trophy}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="info" className="space-y-4 mt-6">
              {/* Pourquoi favori */}
              <div>
                <h3 className="font-semibold text-gradient-gold mb-3">
                  Pourquoi est-il favori ?
                </h3>
                <Card className="card-golden">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {playerStats.whyFavorite}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Votes */}
              <div>
                <h4 className="font-medium mb-3">Votes de la communauté</h4>
                <Card className="card-golden">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Vote className="w-5 h-5 text-primary" />
                      <span className="text-2xl font-bold text-gradient-gold">
                        {player.votes.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      votes reçus au total
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Bouton de vote */}
          <Button
            className={`btn-golden w-full py-3 relative overflow-hidden ${
              isVoting ? 'animate-pulse' : ''
            }`}
            onClick={handleVote}
            disabled={isVoting}
          >
            {isVoting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Vote en cours...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Vote className="w-5 h-5" />
                Voter pour {player.name}
              </div>
            )}
            
            {isVoting && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-[shimmer_2s_ease-in-out]" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};