import React, { useState, useEffect } from "react";
import SwipeCards from "@/components/mytop/SwipeCards";
import CreateTop3Modal from "@/components/mytop/CreateTop3Modal";
import PopularTopsModal from "@/components/mytop/PopularTopsModal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { Player, SharedTop } from '@/types/types';
import { Trophy, Heart, Sparkles, Users, TrendingUp, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ballonDorFavorites2025 } from "@/data/ballonDorFavorites2025";

function MyTop() {
  const [likedPlayers, setLikedPlayers] = useState<Player[]>([]);
  const [mySharedTops, setMySharedTops] = useState<SharedTop[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPopularModal, setShowPopularModal] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();

  // Charger les joueurs depuis Supabase
  const {
    data: playersData = [],
    loading,
    error,
    insert
  } = useSupabaseTable<Player>('players', undefined, 'id, slug, name, position, club, photo, votes, country, age, ranking, trend');

  // Initialiser les joueurs si la base est vide
  useEffect(() => {
    const initPlayers = async () => {
      if (!loading && playersData.length === 0) {
        try {
          await insert(ballonDorFavorites2025);
          console.log('✅ Joueurs Ballon d\'Or 2025 initialisés pour MyTop');
        } catch (error) {
          console.error('Erreur initialisation joueurs MyTop:', error);
        }
      }
    };
    
    initPlayers();
  }, [loading, playersData.length, insert]);

  // Déclencher les modals automatiquement selon le nombre de likes
  useEffect(() => {
    if (likedPlayers.length === 3) {
      setShowCreateModal(true);
      toast({
        title: "🏆 Top 3 prêt !",
        description: "Créez votre Top 3 personnalisé maintenant",
      });
    } else if (likedPlayers.length === 5) {
      setShowCreateModal(true);
      toast({
        title: "🌟 Top 5 exceptionnel !",
        description: "Votre sélection de 5 joueurs est parfaite",
      });
    }
  }, [likedPlayers.length, toast]);

  const handleLike = (player: Player) => {
    if (likedPlayers.length >= 5) {
      toast({
        title: "✋ Limite atteinte",
        description: "Maximum 5 joueurs dans votre top",
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
        description: `${likedPlayers.length + 1}/5 joueurs dans votre top`,
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
      description: "Joueur supprimé de votre sélection",
    });
  };

  const handleReorder = (newOrder: Player[]) => {
    setLikedPlayers(newOrder);
  };

  const handleValidateTop = (orderedPlayers: Player[]) => {
    const newTop: SharedTop = {
      id: `mytop-${Date.now()}`,
      userId: "current-user",
      userName: "Vous",
      userAvatar: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=50&h=50&fit=crop",
      title: `Mon Top ${orderedPlayers.length} personnalisé`,
      players: orderedPlayers,
      topType: orderedPlayers.length === 3 ? "top3" : "top5",
      likes: 0,
      shares: 0,
      createdAt: new Date(),
      isLiked: false,
      comments: [],
      commentCount: 0
    };
    
    setMySharedTops(prev => [newTop, ...prev]);
    setShowCreateModal(false);
    setShowPopularModal(true);
    
    toast({
      title: "🎉 Top créé avec succès !",
      description: `Votre Top ${orderedPlayers.length} a été publié`,
    });
  };

  const handleCloseCreate = () => setShowCreateModal(false);
  const handleClosePopular = () => setShowPopularModal(false);
  const handleContinueSwipe = () => setShowCreateModal(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-neutral-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(251,191,36,0.05),transparent_40%)]" />
      
      {/* Header moderne style Tinder */}
      <header className="relative z-10 px-6 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Swipe ton Ballon d'Or</h1>
              <p className="text-sm text-zinc-400">Trouve tes favoris 2025</p>
            </div>
          </div>
          
          {/* Compteur de likes style moderne */}
          <div className="flex items-center gap-2">
            <div className="bg-black/40 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                <span className="text-white font-bold">{likedPlayers.length}</span>
                <span className="text-zinc-400 text-sm">/5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 bg-white/10 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-pink-500 to-primary transition-all duration-500"
            style={{ width: `${(likedPlayers.length / 5) * 100}%` }}
          />
        </div>
      </header>

      {/* Zone de swipe moderne */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        {currentPlayer ? (
          <SwipeCards
            players={[currentPlayer]}
            onLike={handleLike}
            onDislike={handleDislike}
            likedIds={likedPlayers.map(p => p.id)}
            isAnimating={isAnimating}
            swipeDirection={swipeDirection}
          />
        ) : (
          <div className="text-center text-white">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
            <p className="text-xl font-bold mb-2">Tous les joueurs vus !</p>
            <p className="text-zinc-400">Créez votre top ou recommencez</p>
          </div>
        )}
      </div>

      {/* Actions bar style Tinder */}
      <div className="fixed bottom-24 left-0 right-0 z-20">
        <div className="flex items-center justify-center gap-6 px-6">
          {/* Bouton Dislike */}
          <Button
            size="lg"
            className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-2xl border-4 border-white/20"
            onClick={handleDislike}
          >
            <span className="text-2xl">✕</span>
          </Button>

          {/* Bouton Tops populaires */}
          <Button
            size="lg"
            variant="outline"
            className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20"
            onClick={() => setShowPopularModal(true)}
          >
            <TrendingUp className="w-6 h-6 text-white" />
          </Button>

          {/* Bouton Super Like */}
          <Button
            size="lg"
            className="w-12 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-2xl border-4 border-white/20"
            onClick={() => handleLike(currentPlayer)}
          >
            <span className="text-xl">⭐</span>
          </Button>

          {/* Bouton Like */}
          <Button
            size="lg"
            className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-2xl border-4 border-white/20"
            onClick={() => handleLike(currentPlayer)}
          >
            <Heart className="w-8 h-8 text-white" />
          </Button>
        </div>
      </div>

      {/* Liked players preview */}
      {likedPlayers.length > 0 && (
        <div className="fixed top-24 right-6 z-10">
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-white text-sm font-medium">Vos favoris</span>
            </div>
            <div className="flex gap-1">
              {likedPlayers.map((player, index) => (
                <div key={player.id} className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/50">
                  <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                </div>
              ))}
              {Array.from({ length: 5 - likedPlayers.length }).map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-white/20" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
      <CreateTop3Modal
        isOpen={showCreateModal}
        onClose={handleCloseCreate}
        likedPlayers={likedPlayers}
        onRemoveLike={handleRemoveLike}
        onReorder={handleReorder}
        onValidate={handleValidateTop}
        onContinueSwipe={handleContinueSwipe}
      />

      <PopularTopsModal
        isOpen={showPopularModal}
        onClose={handleClosePopular}
        sharedTops={mySharedTops}
      />
    </div>
  );
}

export default MyTop;