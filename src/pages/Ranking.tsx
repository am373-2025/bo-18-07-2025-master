import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, TrendingUp, Users, Newspaper } from "lucide-react";
import { favoritePlayersNames } from "@/utils/ballonDorPlayers";
import { fetchPlayerByName } from "@/lib/utils";
import { PlayerDetailsModal } from "@/components/ui/player-details-modal";

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Définir d'abord le classement réel statique
export const realRankingStatic = [
  { name: "Ousmane Dembélé", club: "PSG", photo: "https://img.a.transfermarkt.technology/portrait/big/288230-1684148641.jpg?lm=1", goals: 21, assists: 6, matches: 29 },
  { name: "Lamine Yamal", club: "Barcelona", photo: "https://media.api-sports.io/football/players/12345.png", goals: 9, assists: 13, matches: 31 },
  { name: "Raphinha", club: "Barcelona", photo: "https://media.api-sports.io/football/players/12346.png", goals: 18, assists: 9, matches: 34 },
  { name: "Vitinha", club: "PSG", photo: "https://media.api-sports.io/football/players/12347.png", goals: 6, assists: 2, matches: 28 },
  { name: "Mohamed Salah", club: "Liverpool", photo: "https://media.api-sports.io/football/players/306.png", goals: 29, assists: 18, matches: 38 },
  { name: "Joao Neves", club: "PSG", photo: "https://media.api-sports.io/football/players/12348.png", goals: 3, assists: 7, matches: 30 },
  { name: "Achraf Hakimi", club: "PSG", photo: "https://media.api-sports.io/football/players/12349.png", goals: 6, assists: 14, matches: 32 },
  { name: "Pedri", club: "Barcelona", photo: "https://media.api-sports.io/football/players/12350.png", goals: 4, assists: 5, matches: 33 },
  { name: "Robert Lewandowski", club: "Barcelona", photo: "https://media.api-sports.io/football/players/874.png", goals: 27, assists: 7, matches: 36 },
  { name: "Nuno Mendes", club: "PSG", photo: "https://media.api-sports.io/football/players/12351.png", goals: 5, assists: 4, matches: 28 },
  { name: "Harry Kane", club: "Bayern Munich", photo: "https://media.api-sports.io/football/players/120.png", goals: 26, assists: 8, matches: 34 },
  { name: "Joshua Kimmich", club: "Bayern Munich", photo: "https://media.api-sports.io/football/players/12352.png", goals: 2, assists: 9, matches: 33 },
  { name: "Virgil Van Dijk", club: "Liverpool", photo: "https://media.api-sports.io/football/players/12353.png", goals: 4, assists: 2, matches: 37 },
  { name: "Kylian Mbappé", club: "Real Madrid", photo: "https://media.api-sports.io/football/players/278.png", goals: 31, assists: 7, matches: 36 },
  { name: "Serhou Guirassy", club: "Dortmund", photo: "https://media.api-sports.io/football/players/12354.png", goals: 21, assists: 2, matches: 30 },
  { name: "Bruno Fernandes", club: "Manchester United", photo: "https://media.api-sports.io/football/players/12355.png", goals: 8, assists: 9, matches: 34 },
  { name: "William Saliba", club: "Arsenal", photo: "https://media.api-sports.io/football/players/12356.png", goals: 3, assists: 1, matches: 38 },
  { name: "Yan Sommer", club: "Inter Milan", photo: "https://media.api-sports.io/football/players/12357.png", goals: 0, assists: 0, matches: 38 },
  { name: "Lautaro Martínez", club: "Inter Milan", photo: "https://media.api-sports.io/football/players/12358.png", goals: 21, assists: 5, matches: 35 },
  { name: "Jude Bellingham", club: "Real Madrid", photo: "https://media.api-sports.io/football/players/12359.png", goals: 11, assists: 10, matches: 38 },
  // ... compléter jusqu'à 50 si besoin
];

// Puis définir les classements statiques pour chaque filtre
const communityRankingStatic = [
  ...realRankingStatic.map((p, i) => ({ ...p, points: 5000 - i * 100, percentage: 25 - i, trend: i === 0 ? '+1' : (i % 2 === 0 ? '-1' : '='), rank: i + 1 }))
];
const mediaRankingStatic = [
  ...realRankingStatic.map((p, i) => ({ ...p, points: 4800 - i * 90, percentage: 24 - i, trend: i === 1 ? '+1' : (i % 2 === 1 ? '-1' : '='), rank: i + 1 }))
];
const bookmakersRankingStatic = [
  ...realRankingStatic.map((p, i) => ({ ...p, points: 4700 - i * 80, percentage: 23 - i, trend: i === 2 ? '+1' : (i % 3 === 0 ? '-1' : '='), rank: i + 1 }))
];

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
  const [ranking, setRanking] = useState(communityRankingStatic); // Initialiser avec le classement communauté statique
  const [avatars, setAvatars] = useState<{ [name: string]: string }>({});
  const [realRanking] = useState(realRankingStatic);
  const [loadingReal, setLoadingReal] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Actualisation une fois par jour
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastUpdate = localStorage.getItem('rankingLastUpdate');
    if (lastUpdate !== today) {
      setRanking(communityRankingStatic); // Mettre à jour le classement communauté
      localStorage.setItem('rankingLastUpdate', today);
    }
  }, []);

  // Récupérer les vrais avatars API au premier rendu
  useEffect(() => {
    async function fetchAvatars() {
      const newAvatars: { [name: string]: string } = {};
      await Promise.all(ranking.map(async (player) => {
        try {
          const data = await fetchPlayerByName(player.name);
          if (data && data.response && data.response[0]?.player?.photo) {
            newAvatars[player.name] = data.response[0].player.photo;
          }
        } catch {}
      }));
      setAvatars(newAvatars);
    }
    fetchAvatars();
  }, [ranking]);

  // Récupérer le classement réel (top 20 par buts)
  useEffect(() => {
    setLoadingReal(true);
    // Dans l'onglet "Classement réel", utiliser realRanking directement (plus de loading, plus d'appel API)
    setLoadingReal(false);
  }, []);

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
    switch (activeTab) {
      case "media":
        return mediaRankingStatic;
      case "bookmakers":
        return bookmakersRankingStatic;
      case "real":
        return realRankingStatic;
      default: // fans
        return getUserVotesRanking();
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
        {activeTab === "real" ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center text-gradient-gold">🏆 Classement réel (à date du jour)</h2>
            <div className="space-y-2">
              {realRanking.map((player, i) => (
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
                        <span className="text-sm font-bold text-muted-foreground">#{i + 1}</span>
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={player.photo} alt={player.name} />
                        <AvatarFallback>{player.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{player.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{player.club}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{player.goals}⚽</span>
                          <span className="text-xs text-muted-foreground">{player.assists}🅰️</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{player.matches} matchs</div>
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
              <h2 className="text-xl font-bold text-center text-gradient-gold">
                🏆 Podium des Favoris
              </h2>
              
              {/* Podium horizontal compact */}
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
            </div>

            {/* Classement complet */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Classement complet</h3>
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
                          <AvatarImage src={avatars[player.name] || player.photo} alt={player.name} />
                          <AvatarFallback>{player.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{player.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {player.club}
                          </p>
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
                    <div className="font-bold text-lg">47.2K</div>
                    <div className="text-muted-foreground">Total votes</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg">156</div>
                    <div className="text-muted-foreground">Pays</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg">298</div>
                    <div className="text-muted-foreground">Jours restants</div>
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