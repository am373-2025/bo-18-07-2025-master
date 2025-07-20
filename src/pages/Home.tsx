import { useState, useEffect } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PlayerCard } from "@/components/ui/player-card";
import { LiveScoreWidget, NewsFeed } from "@/components/ui/football-features";
import { SearchAndFilters } from "@/components/ui/search-and-filters";
import { FeatureFlagWrapper } from "@/components/ui/feature-flag-wrapper";
import { PlayerDetailsModal } from "@/components/ui/player-details-modal";
import { NotificationCenter } from "@/components/ui/notification-center";
import { SearchModal } from "@/components/ui/search-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useResponsive } from "@/hooks/useResponsive";
import { useProfile } from "@/hooks/useProfile";
import { Link } from "react-router-dom";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { realRankingStatic } from "./Ranking";
import type { Player } from "@/types";
import { Trophy } from "lucide-react";

// Données de test pour les joueurs favoris
const favoritePlayersData: Player[] = [
  {
    id: "1",
    slug: "kylian-mbappe",
    name: "Kylian Mbappé",
    position: "Attaquant",
    club: "Real Madrid",
    photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    votes: 12456,
    isLiked: true
  },
  {
    id: "2",
    slug: "erling-haaland",
    name: "Erling Haaland",
    position: "Attaquant",
    club: "Manchester City",
    photo: "https://images.unsplash.com/photo-1556506751-69a7d6fb64dd?w=400&h=300&fit=crop",
    votes: 11234,
    isLiked: false
  },
  {
    id: "3",
    slug: "jude-bellingham",
    name: "Jude Bellingham",
    position: "Milieu",
    club: "Real Madrid",
    photo: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=400&h=300&fit=crop",
    votes: 9876,
    isLiked: true
  },
  {
    id: "4",
    slug: "pedri-gonzalez",
    name: "Pedri González",
    position: "Milieu",
    club: "FC Barcelone",
    photo: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop",
    votes: 8765,
    isLiked: false
  }
];

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showPlayerDetails, setShowPlayerDetails] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const { toast } = useToast();
  const { isMobile, isTablet } = useResponsive();
  const { addVote, toggleFavorite } = useProfile();
  const [dataInitialized, setDataInitialized] = useState(false);
  const {
    data: playersData,
    loading: loadingSupabaseTable,
    error,
    insert,
    update,
    usingLocalStorage
  } = useSupabaseTable<Player>('players', undefined, 'id, slug, name, position, club, photo, votes, country, age, ranking, trend');
  const top5Ranking = realRankingStatic.slice(0, 5);

  // Handlers pour le top 5 (pas de like, vote local)
  const [top5Votes, setTop5Votes] = useState<{ [name: string]: number }>({});
  const handleTop5Vote = (playerName: string) => {
    setTop5Votes(v => ({ ...v, [playerName]: (v[playerName] || 0) + 1 }));
  };
  const handleTop5ViewDetails = (player: Player) => {
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

  // Initialize with sample data if empty
  useEffect(() => {
    if (!loadingSupabaseTable && playersData.length === 0 && !dataInitialized) {
      insert(favoritePlayersData).catch(console.error);
      setDataInitialized(true);
    }
  }, [loadingSupabaseTable, playersData.length, dataInitialized, insert]);

  const handleViewDetails = (player: Player) => {
    setSelectedPlayer(player);
    setShowPlayerDetails(true);
  };

  const handleVote = async (playerId: string) => {
    const player = playersData.find((p: Player) => p.id === playerId);
    if (player) {
      try {
        // Update player votes in database
        await update(playerId, { votes: (player.votes || 0) + 1 });
        
        // Add user vote record
        await addVote(playerId, player.name);
        
        toast({
          title: "Vote enregistré !",
          description: `Vous avez voté pour ${player?.name}. Merci pour votre participation !`,
        });
      } catch (error) {
        console.error('Error voting:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer votre vote. Vous devez être connecté.",
          variant: "destructive",
        });
      }
    }
  };

  const handleLike = async (playerId: string) => {
    const player = playersData.find((p: Player) => p.id === playerId);
    if (player) {
      try {
        await toggleFavorite(playerId, player.name);
        toast({
          title: "Favoris mis à jour",
          description: `${player.name} ajouté/retiré de vos favoris.`,
        });
      } catch (error) {
        console.error('Error toggling favorite:', error);
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour gérer vos favoris.",
          variant: "destructive",
        });
      }
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
    setNotificationCount(0); // Reset notification count when opened
  };

  // Display data from Supabase or fallback
  const displayPlayers = playersData.length > 0 ? playersData : favoritePlayersData;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
        <div className={`flex items-center justify-between p-4 mx-auto ${isMobile ? 'max-w-md' : isTablet ? 'max-w-2xl' : 'max-w-4xl'}`}>
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
      <main className={`mx-auto p-4 space-y-6 animate-fade-in container-responsive ${isMobile ? 'max-w-md' : isTablet ? 'max-w-2xl' : 'max-w-4xl'}`}>
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
        {loadingSupabaseTable && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement des joueurs...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-8">
            <p className="text-destructive">Erreur: {error}</p>
            <p className="text-muted-foreground text-sm mt-2">Utilisation des données par défaut</p>
          </div>
        )}
        {/* Filtres */}
        

        {/* Top 5 Classement réel */}
        {!loadingSupabaseTable && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold mb-4">Top 5 Classement réel</h2>
          <div className="grid gap-4">
            {top5Ranking.map((player, index) => (
              <PlayerCard
                key={player.name}
                player={{
                  ...player,
                  id: player.name,
                  votes: (top5Votes[player.name] || 0) + (player.votes || 0),
                  isLiked: false,
                  slug: undefined,
                }}
                onViewDetails={handleTop5ViewDetails}
                onVote={() => handleTop5Vote(player.name)}
                onLike={() => {}}
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
        onVote={() => {}}
        onLike={() => {}}
      />

      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <SearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
      />
    </div>
    </ErrorBoundary>
  );
}