import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Crown, Medal, Award, GripVertical, X, Sparkles } from "lucide-react";

interface Player {
  id: string;
  name: string;
  photo?: string;
}

interface CreateTop3ModalProps {
  isOpen: boolean;
  onClose: () => void;
  likedPlayers: Player[];
  onRemoveLike: (id: string) => void;
  onReorder: (newOrder: Player[]) => void;
  onValidate: (orderedPlayers: Player[]) => void;
  onContinueSwipe: () => void;
}

const CreateTop3Modal: React.FC<CreateTop3ModalProps> = ({ 
  isOpen, 
  onClose, 
  likedPlayers, 
  onRemoveLike, 
  onReorder, 
  onValidate, 
  onContinueSwipe 
}) => {
  const [players, setPlayers] = useState<Player[]>(likedPlayers);
  const [topTitle, setTopTitle] = useState("");
  const [topDescription, setTopDescription] = useState("");

  React.useEffect(() => {
    setPlayers(likedPlayers);
  }, [likedPlayers, isOpen]);

  // Déplacement manuel haut/bas
  const movePlayer = (from: number, to: number) => {
    if (to < 0 || to >= players.length) return;
    const reordered = Array.from(players);
    const [removed] = reordered.splice(from, 1);
    reordered.splice(to, 0, removed);
    setPlayers(reordered);
    onReorder(reordered);
  };

  const handleValidate = () => {
    const topData = {
      ...players,
      title: topTitle || `Mon Top ${players.length} Ballon d'Or`,
      description: topDescription
    };
    onValidate(players);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-5 h-5 text-primary" />;
      case 1: return <Medal className="w-5 h-5 text-gray-400" />;
      case 2: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <Trophy className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto h-[90vh] p-0 gap-0 bg-background">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Créer mon Top {players.length}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Organisez vos {players.length} joueurs favoris et partagez votre sélection
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Formulaire de personnalisation */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Titre de votre top</label>
              <Input
                placeholder={`Mon Top ${players.length} Ballon d'Or 2025`}
                value={topTitle}
                onChange={(e) => setTopTitle(e.target.value)}
                className="bg-muted/50"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Description (optionnelle)</label>
              <Textarea
                placeholder="Expliquez vos choix..."
                value={topDescription}
                onChange={(e) => setTopDescription(e.target.value)}
                className="bg-muted/50 min-h-[80px]"
                rows={3}
              />
            </div>
          </div>

          {/* Liste des joueurs avec classement */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Votre classement
            </h3>
            
            {players.map((player, idx) => (
              <div
                key={player.id}
                className="bg-card/50 rounded-xl p-4 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  {/* Rang avec icône */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                    {getRankIcon(idx)}
                  </div>
                  
                  {/* Avatar joueur */}
                  <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                    <AvatarImage src={player.photo} alt={player.name} />
                    <AvatarFallback>{player.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  
                  {/* Infos joueur */}
                  <div className="flex-1">
                    <h4 className="font-semibold">{player.name}</h4>
                    <p className="text-sm text-muted-foreground">{player.position} • {player.club}</p>
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => movePlayer(idx, idx - 1)}
                        disabled={idx === 0}
                        className="w-8 h-8 p-0"
                      >
                        ▲
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => movePlayer(idx, idx + 1)}
                        disabled={idx === players.length - 1}
                        className="w-8 h-8 p-0"
                      >
                        ▼
                      </Button>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveLike(player.id)}
                      className="w-8 h-8 p-0 text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer avec actions */}
        <div className="p-6 pt-4 border-t border-border/50 space-y-3">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onContinueSwipe}
              className="flex-1"
            >
              Continuer le swipe
            </Button>
            <Button
              onClick={handleValidate}
              disabled={players.length === 0}
              className="flex-1 btn-golden"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Créer & Partager
            </Button>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            Votre top sera visible dans la section "Tops Populaires"
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTop3Modal;