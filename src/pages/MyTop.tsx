import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useAuth } from "@/hooks/useAuth";
import { Player, SharedTop } from '@/types/types';
import { Trophy, Heart, Sparkles, Users, TrendingUp, Flame, Star, Crown, Medal, Award, X, Plus, ArrowLeft, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function MyTop() {
  const { user, isAuthenticated } = useAuth();
  const [likedPlayers, setLikedPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCreateTop, setShowCreateTop] = useState(false);
  const [currentView, setCurrentView] = useState<'swipe' | 'create' | 'popular'>('swipe');
  const { toast } = useToast();

  // Charger les joueurs depuis Supabase
  const {
    data: playersData,
    loading,
    error
  } = useSupabaseTable<Player>('players', undefined, 'id, slug, name, position, club, photo, votes, country, age, ranking, trend');

  // Auto-suggest creating top when reaching milestones
  useEffect(() => {
    if (likedPlayers.length === 3 && currentView === 'swipe') {
      toast({
        title: "🏆 Top 3 complet !",
        description: "Voulez-vous créer votre classement ?",
      });
    } else if (likedPlayers.length === 5 && currentView === 'swipe') {
      toast({
        title: "🌟 Top 5 complet !",
        description: "Créez votre classement personnalisé",
      });
    }
  }, [likedPlayers.length, toast, currentView]);

  const handleLike = (player: Player) => {
    if (likedPlayers.length >= 10) {
      toast({
        title: "✋ Limite atteinte",
        description: "Maximum 10 joueurs dans votre sélection",
        variant: "destructive"
      });
      return;
    }

    if (!likedPlayers.find(p => p.id === player.id)) {
      setLikedPlayers(prev => [...prev, player]);
      setSwipeDirection('right');
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentPlayerIndex(prev => (prev + 1) % playersData.length);
        setIsAnimating(false);
        setSwipeDirection(null);
      }, 300);

      toast({
        title: `❤️ ${player.name} ajouté !`,
        description: `${likedPlayers.length + 1}/10 joueurs sélectionnés`,
      });
    }
  };

  const handleDislike = () => {
    setSwipeDirection('left');
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentPlayerIndex(prev => (prev + 1) % playersData.length);
      setIsAnimating(false);
      setSwipeDirection(null);
    }, 300);
  };

  const handleRemoveLike = (id: string) => {
    setLikedPlayers(prev => prev.filter(p => p.id !== id));
    toast({
      title: "🗑️ Joueur retiré",
      description: "Supprimé de votre sélection",
    });
  };

  const movePlayer = (from: number, to: number) => {
    if (to < 0 || to >= likedPlayers.length) return;
    const reordered = Array.from(likedPlayers);
    const [removed] = reordered.splice(from, 1);
    reordered.splice(to, 0, removed);
    setLikedPlayers(reordered);
  };

  const handleCreateTop = () => {
    setCurrentView('popular');
    toast({
      title: "🎉 Top partagé !",
      description: `Votre Top ${likedPlayers.length} est maintenant visible`,
    });
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1: return <Medal className="w-5 h-5 text-gray-400" />;
      case 2: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <Trophy className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Chargement des joueurs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-neutral-900 flex items-center justify-center">
        <div className="text-center text-red-400">
          <p>Erreur: {error}</p>
          <p className="text-sm mt-2">Vérifiez votre connexion</p>
        </div>
      </div>
    );
  }

  const currentPlayer = playersData[currentPlayerIndex];

  // Vue Swipe
  const SwipeView = () => (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Header mobile-first */}
      <header className="bg-card/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gradient-gold">Mon Top</h1>
              <p className="text-xs text-muted-foreground">Swipe tes favoris</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-card/50 rounded-full px-3 py-1.5 border border-border/50">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-bold">{likedPlayers.length}</span>
                <span className="text-xs text-muted-foreground">/10</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Progress */}
        <div className="bg-muted/50 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-pink-500 to-primary transition-all duration-500"
            style={{ width: `${(likedPlayers.length / 10) * 100}%` }}
          />
        </div>

        {/* Swipe Card */}
        <div className="flex-1 flex items-center justify-center py-8">
          {currentPlayer ? (
            <SwipeCard 
              player={currentPlayer}
              onLike={handleLike}
              onDislike={handleDislike}
              isAnimating={isAnimating}
              swipeDirection={swipeDirection}
            />
          ) : (
            <div className="text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
              <p className="text-xl font-bold mb-2">Tous vus !</p>
              <p className="text-muted-foreground">Créez votre top maintenant</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-6 pb-4">
          <Button
            size="lg"
            className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-xl border-4 border-white/20"
            onClick={handleDislike}
          >
            <X className="w-6 h-6 text-white" />
          </Button>

          <Button
            size="lg"
            className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-xl border-4 border-white/20"
            onClick={() => currentPlayer && handleLike(currentPlayer)}
          >
            <Heart className="w-8 h-8 text-white" />
          </Button>
        </div>

        {/* Quick Actions */}
        {likedPlayers.length > 0 && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setCurrentView('create')}
            >
              <Trophy className="w-4 h-4 mr-2" />
              Créer Top ({likedPlayers.length})
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentView('popular')}
            >
              <TrendingUp className="w-4 h-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );

  // Vue Création de Top
  const CreateTopView = () => (
    <div className="min-h-screen bg-background">
      <header className="bg-card/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('swipe')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-gradient-gold">Mon Top {likedPlayers.length}</h1>
          <Button
            size="sm"
            className="btn-golden"
            onClick={handleCreateTop}
            disabled={likedPlayers.length === 0}
          >
            Partager
          </Button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {likedPlayers.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-bold mb-2">Aucun joueur sélectionné</p>
            <p className="text-muted-foreground mb-4">Retournez au swipe pour choisir vos favoris</p>
            <Button onClick={() => setCurrentView('swipe')} className="btn-golden">
              Commencer le swipe
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gradient-gold mb-2">
                Organisez votre classement
              </h2>
              <p className="text-sm text-muted-foreground">
                Glissez pour réorganiser vos {likedPlayers.length} joueurs favoris
              </p>
            </div>

            {likedPlayers.map((player, index) => (
              <Card key={player.id} className="card-golden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                      {getRankIcon(index)}
                    </div>
                    
                    <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                      <AvatarImage src={player.photo} alt={player.name} />
                      <AvatarFallback>{player.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold">{player.name}</h4>
                      <p className="text-sm text-muted-foreground">{player.position} • {player.club}</p>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => movePlayer(index, index - 1)}
                        disabled={index === 0}
                        className="w-8 h-8 p-0"
                      >
                        ▲
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => movePlayer(index, index + 1)}
                        disabled={index === likedPlayers.length - 1}
                        className="w-8 h-8 p-0"
                      >
                        ▼
                      </Button>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveLike(player.id)}
                      className="w-8 h-8 p-0 text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );

  // Vue Tops Populaires  
  const PopularView = () => (
    <div className="min-h-screen bg-background">
      <header className="bg-card/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('swipe')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-gradient-gold">Tops Populaires</h1>
          <div></div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {likedPlayers.length > 0 && (
          <Card className="card-golden">
            <CardContent className="p-4">
              <h3 className="font-bold text-gradient-gold mb-3">Votre Top {likedPlayers.length}</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {likedPlayers.slice(0, 5).map((player, index) => (
                  <div key={player.id} className="flex-shrink-0 text-center">
                    <div className="relative">
                      <Avatar className="w-12 h-12 ring-2 ring-primary/50">
                        <AvatarImage src={player.photo} alt={player.name} />
                        <AvatarFallback>{index + 1}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{index + 1}</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium mt-1 w-16 truncate">{player.name.split(' ').pop()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-lg font-bold mb-2">Tops de la communauté</p>
          <p className="text-muted-foreground mb-4">Découvrez les classements des autres fans</p>
          <Button onClick={() => setCurrentView('swipe')} className="btn-golden">
            Retour au swipe
          </Button>
        </div>
      </main>
    </div>
  );

  // Composant SwipeCard simplifié
  const SwipeCard = ({ player, onLike, onDislike, isAnimating, swipeDirection }: any) => (
    <div className={`relative w-full max-w-sm transition-transform duration-300 ${
      isAnimating ? 
        `${swipeDirection === 'right' ? 'translate-x-full rotate-12' : swipeDirection === 'left' ? '-translate-x-full -rotate-12' : ''}` : 
        ''
    }`}>
      <Card className="card-golden aspect-[3/4] overflow-hidden">
        <CardContent className="p-0 h-full relative">
          <img 
            src={player.photo} 
            alt={player.name}
            className="w-full h-3/4 object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">{player.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary/90">{player.position}</Badge>
              {player.age && <Badge variant="outline" className="text-white border-white/50">{player.age} ans</Badge>}
            </div>
            <p className="text-sm opacity-90">{player.club}</p>
            {player.country && <p className="text-xs opacity-75">{player.country}</p>}
          </div>
          
          {player.ranking && (
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md rounded-full px-3 py-1">
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-white font-bold text-sm">#{player.ranking}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {currentView === 'swipe' && <SwipeView />}
      {currentView === 'create' && <CreateTopView />}
      {currentView === 'popular' && <PopularView />}
      
      {/* Liked players preview - mobile optimized */}
      {currentView === 'swipe' && likedPlayers.length > 0 && (
        <div className="fixed bottom-24 left-4 right-4 z-10">
          <Card className="bg-card/90 backdrop-blur-md border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Vos favoris ({likedPlayers.length})</span>
              </div>
              <div className="flex gap-1 overflow-x-auto">
                {likedPlayers.map((player, index) => (
                  <div key={player.id} className="flex-shrink-0">
                    <Avatar className="w-8 h-8 border-2 border-primary/50">
                      <AvatarImage src={player.photo} alt={player.name} />
                      <AvatarFallback>{index + 1}</AvatarFallback>
                    </Avatar>
                  </div>
                ))}
                {Array.from({ length: 10 - likedPlayers.length }).map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-muted/50 border-2 border-muted flex-shrink-0" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default MyTop;