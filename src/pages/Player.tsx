import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy, 
  Target, 
  Users, 
  Calendar, 
  Star, 
  Heart,
  Vote,
  ArrowLeft,
  Share2
} from "lucide-react";
import { ShareModal } from "@/components/ui/share-modal";
import mbappePhoto from "@/assets/player-mbappe.jpg";
import haalandPhoto from "@/assets/player-haaland.jpg";
import bellinghamPhoto from "@/assets/player-bellingham.jpg";
import { fetchPlayerByName } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  position: string;
  club: string;
  photo: string;
  votes: number;
  isLiked?: boolean;
  slug: string;
}

const playersData: Player[] = [
  {
    id: "1",
    slug: "kylian-mbappe",
    name: "Kylian Mbappé",
    position: "Attaquant",
    club: "Real Madrid",
    photo: mbappePhoto,
    votes: 12456,
    isLiked: false
  },
  {
    id: "2",
    slug: "erling-haaland",
    name: "Erling Haaland",
    position: "Attaquant",
    club: "Manchester City",
    photo: haalandPhoto,
    votes: 11234,
    isLiked: false
  },
  {
    id: "3",
    slug: "jude-bellingham",
    name: "Jude Bellingham",
    position: "Milieu",
    club: "Real Madrid",
    photo: bellinghamPhoto,
    votes: 9876,
    isLiked: false
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

export default function Player() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [player, setPlayer] = useState<Player | null>(null);
  const [apiStats, setApiStats] = useState<any>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const foundPlayer = playersData.find(p => p.slug === slug);
    if (foundPlayer) {
      setPlayer(foundPlayer);
      // Appel API Football pour enrichir les stats
      fetchPlayerByName(foundPlayer.name)
        .then(data => {
          if (data && data.response && data.response.length > 0) {
            setApiStats(data.response[0]);
          }
        })
        .catch(() => setApiStats(null))
        .finally(() => setLoading(false));
    } else {
      navigate("/");
    }
  }, [slug, navigate]);

  if (!player) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement du joueur...</p>
        </div>
      </div>
    );
  }

  // Stats API si dispo, sinon fallback mock
  const playerStats = apiStats ? {
    goals: apiStats.statistics?.[0]?.goals?.total ?? 0,
    assists: apiStats.statistics?.[0]?.goals?.assists ?? 0,
    matches: apiStats.statistics?.[0]?.games?.appearences ?? 0,
    rating: apiStats.statistics?.[0]?.games?.rating ?? null,
    trophies: [],
    whyFavorite: ""
  } : {
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
    
    setPlayer(prev => prev ? { ...prev, votes: prev.votes + 1 } : null);
    
    toast({
      title: "Vote enregistré !",
      description: `Vous avez voté pour ${player.name}. Merci pour votre participation !`,
    });
    
    setIsVoting(false);
  };

  const handleLike = () => {
    setPlayer(prev => prev ? { ...prev, isLiked: !prev.isLiked } : null);
    
    const isLiked = !player.isLiked;
    toast({
      title: isLiked ? "Ajouté aux favoris ❤️" : "Retiré des favoris",
      description: `${player.name} ${isLiked ? 'ajouté à' : 'retiré de'} votre liste de favoris.`,
    });
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const shareContent = {
    title: `${player.name} - Candidat Ballon d'Or 2025`,
    description: `Découvrez le profil de ${player.name}, ${player.position} du ${player.club}. ${player.votes.toLocaleString()} votes reçus !`,
    url: `${window.location.origin}/player/${player.slug}`
  };

  return (
    <div className="min-h-screen bg-background pb-20">
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
        
        {/* Navigation */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Button
            size="sm"
            variant="ghost"
            className="w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/60"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/60"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Infos principales */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {player.name}
              </h1>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/90 text-primary-foreground">
                  {player.position}
                </Badge>
                <span className="text-white/80 text-sm">{player.club}</span>
              </div>
            </div>
            
            
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6 animate-fade-in">
        {/* Tabs */}
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="stats" className="text-sm">
              Statistiques
            </TabsTrigger>
            <TabsTrigger value="info" className="text-sm">
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
                {/* Buts */}
                <Card className="card-golden">
                  <CardContent className="p-3 text-center">
                    <Target className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-xl font-bold text-gradient-gold">
                      {loading ? <span className="animate-pulse">...</span> : (playerStats.goals ?? '—')}
                    </div>
                    <div className="text-xs text-muted-foreground">Buts</div>
                  </CardContent>
                </Card>
                {/* Passes */}
                <Card className="card-golden">
                  <CardContent className="p-3 text-center">
                    <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-xl font-bold text-gradient-gold">
                      {loading ? <span className="animate-pulse">...</span> : (playerStats.assists ?? '—')}
                    </div>
                    <div className="text-xs text-muted-foreground">Passes</div>
                  </CardContent>
                </Card>
                {/* Matchs */}
                <Card className="card-golden">
                  <CardContent className="p-3 text-center">
                    <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-xl font-bold text-gradient-gold">
                      {loading ? <span className="animate-pulse">...</span> : (playerStats.matches ?? '—')}
                    </div>
                    <div className="text-xs text-muted-foreground">Matchs</div>
                  </CardContent>
                </Card>
                {/* Note */}
                <Card className="card-golden">
                  <CardContent className="p-3 text-center">
                    <Star className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-xl font-bold text-gradient-gold">
                      {loading ? <span className="animate-pulse">...</span> : (playerStats.rating ?? '—')}
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

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        content={shareContent}
      />
    </div>
  );
}