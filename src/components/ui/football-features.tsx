import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Target, 
  Calendar, 
  TrendingUp, 
  Award, 
  Clock,
  MapPin,
  Users,
  Star,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

// Match Prediction Feature
export const MatchPrediction = ({ match }: { match: any }) => {
  const [prediction, setPrediction] = useState<string | null>(null);
  
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Prédiction du Match</h3>
      </div>
      
      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
        <div className="text-center">
          <img src={match.homeTeam.logo} alt="" className="w-8 h-8 mx-auto mb-1" />
          <p className="text-xs font-medium">{match.homeTeam.name}</p>
        </div>
        
        <div className="text-center">
          <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{match.time}</p>
        </div>
        
        <div className="text-center">
          <img src={match.awayTeam.logo} alt="" className="w-8 h-8 mx-auto mb-1" />
          <p className="text-xs font-medium">{match.awayTeam.name}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {["1", "X", "2"].map((option) => (
          <Button
            key={option}
            variant={prediction === option ? "default" : "outline"}
            size="sm"
            onClick={() => setPrediction(option)}
            className="text-xs"
          >
            {option === "1" ? match.homeTeam.name.slice(0, 3) : 
             option === "X" ? "Nul" : 
             match.awayTeam.name.slice(0, 3)}
          </Button>
        ))}
      </div>
      
      {prediction && (
        <Badge className="w-full justify-center bg-green-500">
          Prédiction enregistrée: {prediction}
        </Badge>
      )}
    </Card>
  );
};

// Live Score Widget
export const LiveScoreWidget = () => {
  const liveMatches = [
    {
      id: 1,
      homeTeam: { name: "PSG", score: 2, logo: "/placeholder.svg" },
      awayTeam: { name: "OM", score: 1, logo: "/placeholder.svg" },
      minute: "78'",
      status: "live"
    },
    {
      id: 2,
      homeTeam: { name: "Lyon", score: 0, logo: "/placeholder.svg" },
      awayTeam: { name: "Monaco", score: 0, logo: "/placeholder.svg" },
      minute: "45+2'",
      status: "live"
    }
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-5 h-5 text-red-500" />
        <h3 className="font-semibold">Scores en Direct</h3>
        <Badge variant="destructive" className="text-xs animate-pulse">LIVE</Badge>
      </div>
      
      <div className="space-y-3">
        {liveMatches.map((match) => (
          <div key={match.id} className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={match.homeTeam.logo} alt="" className="w-6 h-6" />
                <span className="text-sm font-medium">{match.homeTeam.name}</span>
              </div>
              
              <div className="flex items-center gap-2 text-lg font-bold">
                <span>{match.homeTeam.score}</span>
                <span className="text-muted-foreground">-</span>
                <span>{match.awayTeam.score}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{match.awayTeam.name}</span>
                <img src={match.awayTeam.logo} alt="" className="w-6 h-6" />
              </div>
            </div>
            
            <div className="text-center mt-2">
              <Badge variant="secondary" className="text-xs">
                {match.minute}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Player Stats Comparison
export const PlayerStatsComparison = ({ players }: { players: any[] }) => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Comparaison Statistiques</h3>
      </div>
      
      <div className="space-y-4">
        {players.slice(0, 2).map((player, index) => (
          <div key={player.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <img src={player.image} alt="" className="w-8 h-8 rounded-full" />
              <span className="font-medium text-sm">{player.name}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-bold text-lg">{player.goals}</div>
                <div className="text-muted-foreground">Buts</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{player.assists}</div>
                <div className="text-muted-foreground">Passes D.</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{player.rating}</div>
                <div className="text-muted-foreground">Note</div>
              </div>
            </div>
            
            {index === 0 && <hr className="border-border" />}
          </div>
        ))}
      </div>
    </Card>
  );
};

// Fantasy Football Widget
export const FantasyWidget = () => {
  const [fantasyTeam, setFantasyTeam] = useState([]);
  
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Award className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Fantasy Football</h3>
      </div>
      
      <div className="text-center py-6 text-muted-foreground">
        <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Créez votre équipe fantasy</p>
        <Button size="sm" className="mt-2 btn-golden">
          Commencer
        </Button>
      </div>
    </Card>
  );
};

// News Feed Component
export const NewsFeed = () => {
  const news = [
    {
      id: 1,
      title: "Mbappé remporte le Ballon d'Or 2024",
      summary: "L'attaquant français décroche enfin le prestigieux trophée",
      time: "il y a 2h",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Transfert surprise: Haaland vers le Real Madrid",
      summary: "Le Norvégien serait en négociations avancées",
      time: "il y a 4h",
      image: "/placeholder.svg"
    }
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Actualités Football</h3>
      </div>
      
      <div className="space-y-3">
        {news.map((article) => (
          <div key={article.id} className="flex gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer">
            <img src={article.image} alt="" className="w-12 h-12 rounded object-cover" />
            <div className="flex-1">
              <h4 className="font-medium text-sm line-clamp-2">{article.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{article.summary}</p>
              <span className="text-xs text-muted-foreground">{article.time}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};