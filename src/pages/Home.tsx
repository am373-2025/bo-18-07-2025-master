import { useState, useEffect } from "react";
import { PlayerCard } from "@/components/player/PlayerCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorState } from "@/components/common/ErrorState";
import { LiveScoreWidget, NewsFeed } from "@/components/ui/football-features";
import { PlayerDetailsModal } from "@/components/ui/player-details-modal";
import { NotificationCenter } from "@/components/ui/notification-center";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useDatabase } from "@/hooks/useDatabase";
import { usePlayerActions } from "@/hooks/usePlayerActions";
import { Link } from "react-router-dom";
import type { Player } from "@/types/database";
import { Trophy } from "lucide-react";

function getCountdown(targetDate: Date) {
  const now = new Date();
  const diff = Math.max(0, targetDate.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { voteForPlayer } = usePlayerActions();
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showPlayerDetails, setShowPlayerDetails] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const { toast } = useToast();

  // Charger les joueurs depuis Supabase
  const [playersState, playersActions] = useDatabase('players', {
    orderBy: { column: 'votes', ascending: false },
    limit: 15
  });
  
  // Top 5 calculé depuis les données Supabase
  const top5Ranking = playersState.data
    .slice(0, 5)
    .map((player, index) => ({
      ...player,
      rank: index + 1
    }));

  const handleViewDetails = (player: Player) => {
    setSelectedPlayer(player);
    setShowPlayerDetails(true);
  };

  const ceremonyDate = new Date("2025-10-30T20:00:00");
  const [countdown, setCountdown] = useState(getCountdown(ceremonyDate));
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown(ceremonyDate));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVote = async (player: Player) => {
    await voteForPlayer(player.id, player.name);
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
    setNotificationCount(0); // Reset notification count when opened
  };

  return (
    <>
      <header className="bg-card/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4 mx-auto max-w-md">
          <div className="flex items-center gap-3">
            <Trophy className="w-10 h-10 text-primary animate-float" />
            <div>
              <h1 className="text-gradient-gold font-bold text-lg">Ballon d'Or</h1>
              <p className="text-xs text-muted-foreground">2025</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="relative"
              onClick={handleNotificationClick}
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-xs text-primary-foreground font-bold">
                    {notificationCount}
                  </span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="mx-auto p-4 space-y-6 animate-fade-in max-w-md">
        {/* Countdown moderne */}
        <div className="flex flex-col items-center justify-center gap-2 py-4">
          <div className="flex items-center gap-3 bg-gradient-to-r from-gold/20 via-primary/10 to-accent/20 rounded-xl px-6 py-3 shadow-lg">
            <svg className="w-8 h-8 text-gold animate-glow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
            <div className="flex flex-col items-center">
              <span className="text-gradient-gold font-bold text-lg">Cérémonie officielle</span>
              <span className="text-xs text-muted-foreground">30 Octobre 2025, 20h00</span>
            </div>
          </div>
          <div className="flex gap-4 mt-2 text-center">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-extrabold text-gradient-gold">{countdown.days}</span>
              <span className="text-xs text-muted-foreground">Jours</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-extrabold text-gradient-gold">{String(countdown.hours).padStart(2, '0')}</span>
              <span className="text-xs text-muted-foreground">Heures</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-extrabold text-gradient-gold">{String(countdown.minutes).padStart(2, '0')}</span>
              <span className="text-xs text-muted-foreground">Min</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-extrabold text-gradient-gold">{String(countdown.seconds).padStart(2, '0')}</span>
              <span className="text-xs text-muted-foreground">Sec</span>
            </div>
          </div>
        </div>
        {/* Section Hero */}
        <div className="text-center space-y-4">
          
          <div>
            <h2 className="text-2xl font-bold text-gradient-gold mb-2">
              Votez pour votre favori
            </h2>
            <p className="text-muted-foreground">
              Découvrez les candidats au Ballon d'Or 2025 et participez aux votes de la communauté
            </p>
          </div>
        </div>

        {/* Loading state */}
        {playersState.loading && (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" text="Chargement des candidats Ballon d'Or..." />
          </div>
        )}

        {/* Error state */}
        {playersState.error && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-amber-800 mb-2">
              <span className="text-sm font-medium">⚠️ Mode hors ligne</span>
            </div>
            <p className="text-xs text-amber-700">{playersState.error}</p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={playersActions.refresh}
              className="mt-2 text-xs"
            >
              Réessayer la connexion
            </Button>
          </div>
        )}

        {/* Top 5 Classement réel */}
        {!playersState.loading && playersState.data.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2 text-gradient-gold">Top 5 Ballon d'Or 2025</h2>
            <Badge variant="outline" className="text-xs mb-4">
              {playersState.count} candidats • {playersState.error ? 'Mode hors ligne' : 'Base de données'}
            </Badge>
          </div>
          <div className="grid gap-4">
            {top5Ranking.map((player, index) => (
              <PlayerCard
                key={player.name}
                player={player}
                onViewDetails={handleViewDetails}
                variant="featured"
              />
            ))}
          </div>
        </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-muted to-card p-6 rounded-2xl text-center space-y-4 border border-border/50">
          <h3 className="text-xl font-bold text-gradient-gold">
            Votre vote compte !
          </h3>
          <p className="text-sm text-muted-foreground">
            Rejoignez des milliers de fans et votez pour le prochain Ballon d'Or
          </p>
          <Link to="/ranking" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 btn-golden w-full">
            Découvrir tous les candidats
          </Link>
        </div>
      </main>

      {/* Modales */}

      <PlayerDetailsModal
        player={selectedPlayer}
        isOpen={showPlayerDetails}
        onClose={() => setShowPlayerDetails(false)}
        onVote={handleVote}
        onLike={() => {}}
      />

      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}