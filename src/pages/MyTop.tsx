import React, { useState } from "react";
import SwipeCards from "@/components/mytop/SwipeCards";
import CreateTopModal from "@/components/mytop/CreateTopModal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import CreateTop3Modal from "@/components/mytop/CreateTop3Modal";
import PopularTops from "@/components/mytop/PopularTopsModal";
import { Player, SharedTop } from '@/types/types';
import rankingData from "@/pages/Ranking";
import { fetchPlayerByName } from "@/lib/utils";
import { favoritePlayersNames } from "@/utils/ballonDorPlayers";
// Type SharedTop local (à centraliser ensuite)
// Type SharedTop local (à centraliser ensuite)

const playerNames = favoritePlayersNames;

function MyTop() {
  const [likedPlayers, setLikedPlayers] = useState<Player[]>([]); // [{id, name, photo}]
  const [mySharedTops, setMySharedTops] = useState<SharedTop[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPopularModal, setShowPopularModal] = useState(false);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all(playerNames.map(name => fetchPlayerByName(name)
      .then(data => data.response?.[0] || null)
      .catch(() => null)
    ))
      .then(apiPlayers => {
        const fallbackPlayers = [
          {
            id: "1",
            name: "Kylian Mbappé",
            photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop"
          },
          {
            id: "2",
            name: "Erling Haaland",
            photo: "https://images.unsplash.com/photo-1556506751-69a7d6fb64dd?w=100&h=100&fit=crop"
          },
          {
            id: "3",
            name: "Jude Bellingham",
            photo: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=100&h=100&fit=crop"
          },
          {
            id: "4",
            name: "Pedri González",
            photo: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop"
          }
        ];
        const playersFinal = apiPlayers.map((apiPlayer, i) => {
          if (apiPlayer) {
            return {
              id: apiPlayer.player.id,
              name: apiPlayer.player.name,
              photo: apiPlayer.player.photo || fallbackPlayers[i].photo,
              stats: apiPlayer.statistics?.[0] || {},
            };
          } else {
            return fallbackPlayers[i];
          }
        });
        setAllPlayers(playersFinal);
      })
      .catch(() => {
        setError("Erreur lors du chargement des joueurs depuis l'API.");
        setAllPlayers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Ouvre la modale automatiquement à 3 ou 5 likes (et pas plus)
  React.useEffect(() => {
    if (likedPlayers.length === 3 || likedPlayers.length === 5) {
      setShowCreateModal(true);
    } else if (likedPlayers.length > 5) {
      setLikedPlayers(likedPlayers.slice(0, 5)); // Limite à 5
    }
  }, [likedPlayers]);

  const handleLike = (player: Player) => {
    if (!likedPlayers.find(p => p.id === player.id)) setLikedPlayers([...likedPlayers, player]);
  };
  const handleDislike = () => {};
  const handleRemoveLike = (id: string) => setLikedPlayers(likedPlayers.filter(p => p.id !== id));
  const handleReorder = (newOrder: Player[]) => setLikedPlayers(newOrder);
  const handleValidateTop = (orderedPlayers: Player[]) => {
    // Créer un nouveau top et l'ajouter à mes tops
    const newTop: SharedTop = {
      id: `mytop-${Date.now()}`,
      userId: "current-user",
      userName: "Vous",
      userAvatar: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=50&h=50&fit=crop",
      title: "Mon Top 3 personnalisé",
      players: orderedPlayers,
      topType: "top3",
      likes: 0,
      shares: 0,
      createdAt: new Date(),
      isLiked: false,
      comments: [],
      commentCount: 0
    };
    setMySharedTops([newTop, ...mySharedTops]);
    setShowCreateModal(false);
    setShowPopularModal(true);
  };
  const handleCloseCreate = () => setShowCreateModal(false);
  const handleClosePopular = () => setShowPopularModal(false);
  const handleContinueSwipe = () => setShowCreateModal(false);

  return (
    <div className={`relative min-h-screen bg-gradient-to-br from-black via-zinc-900 to-neutral-900 flex flex-col items-center p-0 pb-24${showPopularModal ? ' overflow-hidden' : ''}`}>
      {/* Header sticky moderne */}
      <header className="sticky top-0 z-30 w-full bg-gradient-to-r from-black/90 to-yellow-900/80 shadow-gold flex items-center justify-center py-4 mb-2 animate-fade-in">
        <span className="text-3xl mr-2">🏆</span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gradient-gold tracking-tight uppercase drop-shadow-gold">Swipe ton Ballon d'Or</h1>
      </header>
      {/* Compteur de likes moderne */}
      <div className="flex items-center gap-2 mb-4 animate-fade-in">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 text-black font-bold shadow-gold text-lg transition-transform duration-300 scale-110 border-2 border-gold">
          <svg className="w-5 h-5 mr-1 text-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          {likedPlayers.length}
        </span>
        <span className="text-xs text-gold font-semibold">/ 5 max</span>
      </div>
      {/* Zone swipe moderne */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center animate-slide-up">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="ml-4 text-muted-foreground">Chargement des joueurs...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <SwipeCards players={allPlayers.filter(Boolean)} onLike={handleLike} onDislike={handleDislike} likedIds={likedPlayers.map(p => p.id)} />
        )}
      </div>
      {/* Bouton flottant moderne */}
      <button
        className="fixed bottom-24 right-6 z-40 bg-gradient-to-tr from-yellow-400 to-yellow-600 text-black rounded-full shadow-gold px-6 py-3 flex items-center gap-2 font-bold text-lg border-2 border-gold hover:scale-105 active:scale-95 transition-all duration-200 animate-fade-in hover:bg-yellow-500/90"
        onClick={() => setShowPopularModal(true)}
      >
        <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 6v2a10 10 0 01-10 10H5.41l-3.7 3.71A1 1 0 012 20.59V18A10 10 0 0112 8h2"/></svg>
        Tops populaires
      </button>
      {/* Modales et autres composants */}
      <CreateTop3Modal
        isOpen={showCreateModal}
        onClose={handleCloseCreate}
        likedPlayers={likedPlayers}
        onRemoveLike={handleRemoveLike}
        onReorder={handleReorder}
        onValidate={handleValidateTop}
        onContinueSwipe={handleContinueSwipe}
      />
      {showPopularModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <PopularTops sharedTops={mySharedTops} onClose={handleClosePopular} />
        </div>
      )}
      {/* Footer flottant moderne (optionnel) */}
      {/* <footer className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur shadow-inner py-3 flex justify-center items-center z-20 animate-fade-in">
        <span className="text-sm text-gold">© 2025 Ballon d'Or Social</span>
      </footer> */}
    </div>
  );
}

export default MyTop; 