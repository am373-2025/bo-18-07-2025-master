import React, { useState, useMemo } from "react";
import TinderCard from "react-tinder-card";
import PlayerCard from "@/components/mytop/PlayerCard";

const mockPlayers = [
  { id: "1", name: "Kylian Mbappé", photo: "/player-mbappe.jpg", club: "PSG", country: "France" },
  { id: "2", name: "Erling Haaland", photo: "/player-haaland.jpg", club: "Man City", country: "Norvège" },
  { id: "3", name: "Jude Bellingham", photo: "/player-bellingham.jpg", club: "Real Madrid", country: "Angleterre" },
  { id: "4", name: "Vinicius Jr", photo: "https://randomuser.me/api/portraits/men/32.jpg", club: "Real Madrid", country: "Brésil" },
  { id: "5", name: "Kevin De Bruyne", photo: "https://randomuser.me/api/portraits/men/33.jpg", club: "Man City", country: "Belgique" },
];

const swipeLabels = {
  right: { text: "LIKE", color: "bg-green-500/80 text-white" },
  left: { text: "NOPE", color: "bg-red-500/80 text-white" },
};

function SwipeCards({ players, onLike, onDislike, likedIds }) {
  const [currentIndex, setCurrentIndex] = useState(players.length - 1);
  const [swipeDir, setSwipeDir] = useState(null);
  const [swiping, setSwiping] = useState(false);

  const childRefs = useMemo(() => Array(players.length).fill(0).map(() => React.createRef<any>()), [players.length]);

  const swiped = (direction, playerId, idx) => {
    setSwipeDir(direction);
    setSwiping(true);
    setTimeout(() => {
      setSwiping(false);
      setSwipeDir(null);
      setCurrentIndex(idx - 1);
    }, 350);
    if (direction === "right") onLike(players.find(p => p.id === playerId));
    if (direction === "left") onDislike(playerId);
  };

  const outOfFrame = (name) => {};

  // Fonction pour ignorer le joueur actuel (bouton ❌)
  const handleIgnore = () => {
    setCurrentIndex(prev => prev - 1);
  };

  // Fonction pour liker le joueur actuel (bouton ❤️)
  const handleLike = () => {
    if (currentIndex < 0) return;
    onLike(players[currentIndex]);
    setCurrentIndex(prev => prev - 1);
  };

  // Si on atteint la fin, recommencer depuis le début (boucle)
  React.useEffect(() => {
    if (currentIndex < 0 && players.length > 0) {
      setCurrentIndex(players.length - 1);
    }
  }, [currentIndex, players.length]);

  const currentPlayer = players[currentIndex];

  if (!currentPlayer) return null;

  return (
    <div className="relative flex flex-col items-center gap-6 w-full min-h-[420px]">
      {/* Centrage vertical/horizontal de la card avec swipe */}
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full mb-4">
        <TinderCard
          key={currentPlayer.id}
          onSwipe={dir => {
            if (dir === 'right') handleLike();
            if (dir === 'left') handleIgnore();
          }}
          preventSwipe={['up', 'down']}
        >
          <PlayerCard player={currentPlayer} liked={likedIds.includes(currentPlayer.id)} />
        </TinderCard>
      </div>
      <div className="flex gap-8 mt-0">
        <button
          className="btn-outline rounded-full w-16 h-16 text-3xl shadow-lg bg-white/60 hover:bg-red-100 transition-all duration-200"
          onClick={handleIgnore}
          aria-label="Dislike"
        >❌</button>
        <button
          className="btn-golden rounded-full w-16 h-16 text-3xl shadow-lg bg-white/60 hover:bg-pink-100 transition-all duration-200"
          onClick={handleLike}
          aria-label="Like"
        >❤️</button>
      </div>
    </div>
  );
}

export default SwipeCards; 