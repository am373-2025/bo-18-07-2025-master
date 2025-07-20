import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, TrendingUp, Users, Newspaper } from "lucide-react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { PlayerDetailsModal } from "@/components/ui/player-details-modal";
import type { Player } from "@/types";

// Fonction pour récupérer les votes utilisateurs depuis le localStorage
function getUserVotesRanking() {
  const votes = JSON.parse(localStorage.getItem('playerVotes') || '{}');
  // votes = { 'Kylian Mbappé': 12, ... }
  return realRankingStatic
    .map((p) => ({ ...p, votes: votes[p.name] || 0 }))
    .sort((a, b) => b.votes - a.votes)
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

export default function Ranking() {
  const [activeTab, setActiveTab] = useState("community");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  
  // Charger les 30 joueurs depuis Supabase
  const {
    data: playersData,
    loading: loadingPlayers,
    error: playersError,
    usingLocalStorage
  } = useSupabaseTable<Player>('players', undefined, 'id, slug, name, position, club, photo, votes, country, age, ranking, trend');

  // Créer les différents classements à partir des données Supabase
  const createRankings = (players: Player[]) => {
    // Trier par votes pour le classement communauté
    const communityRanking = players
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .map((p, i) => ({ 
        ...p, 
        points: 5000 - i * 100, 
        percentage: Math.max(5, 25 - i), 
        trend: p.trend || (i === 0 ? '+1' : (i % 2 === 0 ? '-1' : '=')), 
        rank: i + 1 
      }));

    // Variante pour les médias (léger décalage)
    const mediaRanking = players
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .map((p, i) => ({ 
        ...p, 
        points: 4800 - i * 90, 
        percentage: Math.max(4, 24 - i), 
        trend: p.trend || (i === 1 ? '+1' : (i % 2 === 1 ? '-1' : '=')), 
        rank: i + 1 
      }));

    // Variante pour les bookmakers
    const bookmakersRanking = players
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .map((p, i) => ({ 
        ...p, 
        points: 4700 - i * 80, 
        percentage: Math.max(3, 23 - i), 
        trend: p.trend || (i === 2 ? '+1' : (i % 3 === 0 ? '-1' : '=')), 
        rank: i + 1 
      }));

    // Classement réel (par ranking existant ou par votes)
    const realRanking = players
      .sort((a, b) => (a.ranking || 999) - (b.ranking || 999))
      .map((p, i) => ({ ...p, rank: i + 1 }));

    return { communityRanking, mediaRanking, bookmakersRanking, realRanking };
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getTrendColor = (trend: string | undefined) => {
    if (!trend) return "text-muted-foreground";
    if (trend.includes("+")) return "text-green-500";
    if (trend.includes("-")) return "text-red-500";
    return "text-muted-foreground";
  };

  const getCurrentRanking = () => {
    if (!playersData || playersData.length === 0) return [];
    
    const { communityRanking, mediaRanking, bookmakersRanking, realRanking } = createRankings(playersData);
    
    switch (activeTab) {
      case "media":
        return mediaRanking;
      case "bookmakers":
        return bookmakersRanking;
      case "real":
        return realRanking;
      default: // fans
        return communityRanking;
    }
  };
  
  const currentRanking = getCurrentRanking();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
        <div className="p-4 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-primary animate-glow" />
            <h1 className="text-2xl font-bold text-gradient-gold">Classement</h1>
          </div>
          
          {/* Tabs modernes avec animations fluides */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm border border-border/20 rounded-xl p-1">
              <TabsTrigger 
                value="community" 
                className="flex items-center gap-2 text-xs font-medium rounded-lg transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-105"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Fans</span>
                <span className="sm:hidden">Fans</span>
              </TabsTrigger>
              <TabsTrigger 
                value="media" 
                className="flex items-center gap-2 text-xs font-medium rounded-lg transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-105"
              >
                <Newspaper className="w-4 h-4" />
                <span className="hidden sm:inline">Médias</span>
                <span className="sm:hidden">Méd.</span>
              </TabsTrigger>
              <TabsTrigger 
                value="bookmakers" 
                className="flex items-center gap-2 text-xs font-medium rounded-lg transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-105"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Bookmakers</span>
                <span className="sm:hidden">Book.</span>
              </TabsTrigger>
              <TabsTrigger 
                value="real" 
                className="flex items-center gap-2 text-xs font-medium rounded-lg transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-105"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Classement réel</span>
                <span className="sm:hidden">Réel</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6 animate-fade-in">
        {/* Loading state */}
        {loadingPlayers && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement des joueurs...</p>
          </div>
        )}

        {/* Error state */}
        {playersError && (
          <div className="text-center py-8">
            <p className="text-destructive">Erreur: {playersError}</p>
            <p className="text-muted-foreground text-sm mt-2">
              {usingLocalStorage ? 'Utilisation des données locales' : 'Vérifiez votre connexion'}
            </p>
          </div>
        )}

        {activeTab === "real" ? (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gradient-gold mb-2">🏆 Classement Officiel Ballon d'Or 2025</h2>
              <Badge variant="outline" className="text-xs">
                {currentRanking.length} candidats • Mise à jour: {new Date().toLocaleDateString('fr-FR')}
              </Badge>
            </div>
            <div className="space-y-2">
              {currentRanking.map((player, i) => (
                <Card key={`${player.name}-${i}`} className="card-golden hover:scale-[1.01] transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    setSelectedPlayer({
                      ...player,
                      id: player.name, // fallback if no id
                      position: player.position || "",
                      votes: player.votes || 0,
                    });
                    setModalOpen(true);
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 text-center">
                        {i < 3 ? (
                          getRankIcon(i + 1)
                        ) : (
                          <span className="text-sm font-bold text-muted-foreground">#{i + 1}</span>
                        )}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={player.photo} alt={player.name} />
                        <AvatarFallback>{player.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{player.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{player.club}</p>
                        {player.country && (
                          <p className="text-xs text-muted-foreground truncate">{player.country}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-sm font-medium">{(player.votes || 0).toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">votes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {player.trend && (
                            <span className={`text-xs ${getTrendColor(player.trend)}`}>
                              {player.trend}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Top 3 Podium horizontal moderne */}
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gradient-gold mb-2">
                  🏆 Podium des Favoris - {activeTab === 'community' ? 'Votes Communauté' : activeTab === 'media' ? 'Classement Médias' : 'Cotes Bookmakers'}
                </h2>
                <Badge variant="outline" className="text-xs">
                  {currentRanking.length} candidats • {usingLocalStorage ? 'Données locales' : 'Données Supabase'}
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-center text-gradient-gold">
                Top 3
              </h2>
              
              {/* Podium horizontal compact */}
              {currentRanking.length >= 3 && (
              <div className="flex items-end justify-center gap-2 px-4">
                {/* 2ème place */}
                <div className="flex-1 text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
                  <div className="bg-gradient-to-t from-slate-400/20 to-transparent rounded-t-lg p-3 h-20 flex flex-col justify-end">
                    <Avatar className="w-12 h-12 mx-auto mb-2 ring-2 ring-slate-400/30" onClick={() => {
                      const player = currentRanking[1];
                      setSelectedPlayer({
                        ...player,
                        id: player.name,
                        position: player.position || "",
                        votes: player.votes || 0,
                      });
                      setModalOpen(true);
                    }}>
                      <AvatarImage src={currentRanking[1]?.photo} alt={currentRanking[1]?.name} />
                      <AvatarFallback>{currentRanking[1]?.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <Medal className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <div className="text-xs font-bold text-slate-400">2ème</div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-semibold truncate">{currentRanking[1]?.name}</div>
                    <div className="text-xs text-primary font-bold">{currentRanking[1]?.percentage}%</div>
                  </div>
                </div>

                {/* 1ère place (plus haute) */}
                <div className="flex-1 text-center animate-slide-up" style={{ animationDelay: '100ms' }}>
                  <div className="bg-gradient-to-t from-yellow-500/30 to-transparent rounded-t-lg p-4 h-28 flex flex-col justify-end">
                    <Avatar className="w-16 h-16 mx-auto mb-2 ring-4 ring-yellow-500/50 animate-glow" onClick={() => {
                      const player = currentRanking[0];
                      setSelectedPlayer({
                        ...player,
                        id: player.name,
                        position: player.position || "",
                        votes: player.votes || 0,
                      });
                      setModalOpen(true);
                    }}>
                      <AvatarImage src={currentRanking[0]?.photo} alt={currentRanking[0]?.name} />
                      <AvatarFallback>{currentRanking[0]?.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1 animate-pulse" />
                    <div className="text-xs font-bold text-yellow-500">1er</div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-bold text-gradient-gold truncate">{currentRanking[0]?.name}</div>
                    <div className="text-xs text-primary font-bold">{currentRanking[0]?.percentage}%</div>
                  </div>
                </div>

                {/* 3ème place */}
                <div className="flex-1 text-center animate-slide-up" style={{ animationDelay: '300ms' }}>
                  <div className="bg-gradient-to-t from-amber-600/20 to-transparent rounded-t-lg p-3 h-16 flex flex-col justify-end">
                    <Avatar className="w-10 h-10 mx-auto mb-2 ring-2 ring-amber-600/30" onClick={() => {
                      const player = currentRanking[2];
                      setSelectedPlayer({
                        ...player,
                        id: player.name,
                        position: player.position || "",
                        votes: player.votes || 0,
                      });
                      setModalOpen(true);
                    }}>
                      <AvatarImage src={currentRanking[2]?.photo} alt={currentRanking[2]?.name} />
                      <AvatarFallback>{currentRanking[2]?.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <Award className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                    <div className="text-xs font-bold text-amber-600">3ème</div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-semibold truncate">{currentRanking[2]?.name}</div>
                    <div className="text-xs text-primary font-bold">{currentRanking[2]?.percentage}%</div>
                  </div>
                </div>
              </div>
              )}
            </div>

            {/* Classement complet */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Top 30 complet</h3>
                <Badge variant="outline" className="text-xs">
                  {currentRanking.length} candidats
                </Badge>
              </div>
              
              <div className="space-y-2">
                {currentRanking.slice(3).map((player, index) => (
                  <Card 
                    key={`${player.name}-${player.rank}`} 
                    className="card-golden hover:scale-[1.01] transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      setSelectedPlayer({
                        ...player,
                        id: player.name,
                        position: player.position || "",
                        votes: player.votes || 0,
                      });
                      setModalOpen(true);
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 text-center">
                          <span className="text-sm font-bold text-muted-foreground">
                            #{player.rank}
                          </span>
                        </div>
                        
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={player.photo} alt={player.name} />
                          <AvatarFallback>{player.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{player.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {player.club}
                          </p>
                          {player.country && (
                            <p className="text-xs text-muted-foreground truncate">{player.country} • {player.age} ans</p>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">
                              {player.percentage}%
                            </span>
                            <span className={`text-xs ${getTrendColor(player.trend)}`}>
                              {player.trend}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(player.points !== undefined ? player.points : 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Statistiques */}
            <Card className="card-golden">
              <CardContent className="p-4 text-center space-y-2">
                <h3 className="font-bold text-gradient-gold">Statistiques des votes</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-bold text-lg">
                      {currentRanking.reduce((sum, p) => sum + (p.votes || 0), 0).toLocaleString()}
                    </div>
                    <div className="text-muted-foreground">Total votes</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg">{currentRanking.length}</div>
                    <div className="text-muted-foreground">Candidats</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg">Oct 30</div>
                    <div className="text-muted-foreground">Cérémonie</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
      <PlayerDetailsModal
        player={selectedPlayer}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onVote={() => {}}
        onLike={() => {}}
      />
    </div>
  );
}