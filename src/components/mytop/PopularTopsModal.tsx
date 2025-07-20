import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Share2, MessageCircle, Trophy, Crown, TrendingUp, Filter, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SharedTop } from '@/types/types';

interface PopularTopsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sharedTops: SharedTop[];
}

// Données mockées pour les tops populaires
const MOCK_POPULAR_TOPS: SharedTop[] = [
  {
    id: "1",
    userId: "user1",
    userName: "FootballFan2024",
    userAvatar: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=50&h=50&fit=crop",
    title: "Mon Top 3 absolu 2025",
    players: [
      { id: "1", name: "Kylian Mbappé", photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop" },
      { id: "2", name: "Erling Haaland", photo: "https://images.unsplash.com/photo-1556506751-69a7d6fb64dd?w=100&h=100&fit=crop" },
      { id: "3", name: "Jude Bellingham", photo: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=100&h=100&fit=crop" },
    ],
    topType: "top3",
    likes: 342,
    shares: 89,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isLiked: false,
    comments: [],
    commentCount: 15
  },
  {
    id: "2",
    userId: "user2",
    userName: "BallonDorExpert",
    userAvatar: "https://images.unsplash.com/photo-1556506751-69a7d6fb64dd?w=50&h=50&fit=crop",
    title: "Les 5 légendes actuelles",
    players: [
      { id: "7", name: "Lionel Messi", photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop" },
      { id: "8", name: "Cristiano Ronaldo", photo: "https://images.unsplash.com/photo-1556506751-69a7d6fb64dd?w=100&h=100&fit=crop" },
      { id: "1", name: "Kylian Mbappé", photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop" },
      { id: "2", name: "Erling Haaland", photo: "https://images.unsplash.com/photo-1556506751-69a7d6fb64dd?w=100&h=100&fit=crop" },
      { id: "3", name: "Jude Bellingham", photo: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=100&h=100&fit=crop" },
    ],
    topType: "top5",
    likes: 567,
    shares: 234,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    isLiked: true,
    comments: [],
    commentCount: 28
  },
  {
    id: "3",
    userId: "current-user",
    userName: "Vous",
    userAvatar: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=50&h=50&fit=crop",
    title: "Mon sélection perso",
    players: [
      { id: "1", name: "Kylian Mbappé", photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop" },
      { id: "2", name: "Erling Haaland", photo: "https://images.unsplash.com/photo-1556506751-69a7d6fb64dd?w=100&h=100&fit=crop" },
      { id: "3", name: "Jude Bellingham", photo: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=100&h=100&fit=crop" },
    ],
    topType: "top3",
    likes: 15,
    shares: 3,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    isLiked: false,
    comments: [],
    commentCount: 2
  }
];

export default function PopularTopsModal({ isOpen, onClose, sharedTops = [] }: PopularTopsModalProps) {
  const [tops, setTops] = useState<SharedTop[]>([...sharedTops, ...MOCK_POPULAR_TOPS]);
  const [activeFilter, setActiveFilter] = useState<'trending' | 'recent' | 'my-tops'>('trending');
  const [searchQuery, setSearchQuery] = useState("");

  const handleLike = (topId: string) => {
    setTops(prev => prev.map(top => 
      top.id === topId 
        ? { ...top, likes: top.isLiked ? top.likes - 1 : top.likes + 1, isLiked: !top.isLiked }
        : top
    ));
  };

  const handleShare = (top: SharedTop) => {
    setTops(prev => prev.map(t => 
      t.id === top.id ? { ...t, shares: t.shares + 1 } : t
    ));
  };

  const filteredTops = tops.filter(top => {
    const matchesSearch = top.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         top.userName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (activeFilter === 'my-tops') return top.userId === 'current-user';
    if (activeFilter === 'recent') return true; // Tri par date plus tard
    return true; // trending = tous par défaut
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}j`;
    if (hours > 0) return `${hours}h`;
    return "maintenant";
  };

  const getTopTypeEmoji = (type: string) => {
    switch (type) {
      case 'top3': return '🥉';
      case 'top5': return '🏆';
      default: return '🏅';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto h-[90vh] p-0 gap-0 bg-background border-border">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Tops Populaires
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Search bar moderne */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un top..." 
              className="pl-10 bg-muted/50 border-border/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </DialogHeader>

        {/* Filters modernes */}
        <div className="px-6 py-4 border-b border-border/50">
          <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as any)}>
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              <TabsTrigger value="trending" className="flex items-center gap-2 text-xs">
                <TrendingUp className="w-4 h-4" />
                Tendances
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-2 text-xs">
                <Crown className="w-4 h-4" />
                Récents
              </TabsTrigger>
              <TabsTrigger value="my-tops" className="flex items-center gap-2 text-xs">
                <Trophy className="w-4 h-4" />
                Mes tops
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Liste des tops avec scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {filteredTops.map((top) => (
            <div key={top.id} className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden">
              {/* Header du top */}
              <div className="p-4 pb-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                      <AvatarImage src={top.userAvatar} alt={top.userName} />
                      <AvatarFallback>{top.userName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{top.userName}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(top.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {getTopTypeEmoji(top.topType)} {top.topType.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <h4 className="font-bold text-base mb-3">{top.title}</h4>
              </div>

              {/* Joueurs - Design moderne */}
              <div className="px-4 pb-3">
                {top.topType === 'top3' ? (
                  // Podium style pour top 3
                  <div className="flex items-end justify-center gap-2">
                    {/* 2ème place */}
                    <div className="flex flex-col items-center">
                      <div className="relative mb-2">
                        <Avatar className="w-12 h-12 ring-2 ring-gray-400">
                          <AvatarImage src={top.players[1]?.photo} alt={top.players[1]?.name} />
                          <AvatarFallback>2</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">2</span>
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg px-2 py-1 min-w-[60px]">
                        <p className="text-xs font-medium text-center truncate">
                          {top.players[1]?.name?.split(' ').pop()}
                        </p>
                      </div>
                    </div>

                    {/* 1ère place */}
                    <div className="flex flex-col items-center">
                      <div className="relative mb-2">
                        <Avatar className="w-16 h-16 ring-4 ring-primary">
                          <AvatarImage src={top.players[0]?.photo} alt={top.players[0]?.name} />
                          <AvatarFallback>1</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Crown className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="bg-primary/20 rounded-lg px-2 py-1 min-w-[60px] border border-primary/30">
                        <p className="text-xs font-bold text-center truncate text-primary">
                          {top.players[0]?.name?.split(' ').pop()}
                        </p>
                      </div>
                    </div>

                    {/* 3ème place */}
                    <div className="flex flex-col items-center">
                      <div className="relative mb-2">
                        <Avatar className="w-12 h-12 ring-2 ring-amber-600">
                          <AvatarImage src={top.players[2]?.photo} alt={top.players[2]?.name} />
                          <AvatarFallback>3</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">3</span>
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg px-2 py-1 min-w-[60px]">
                        <p className="text-xs font-medium text-center truncate">
                          {top.players[2]?.name?.split(' ').pop()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Layout horizontal pour top 5
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {top.players.map((player, index) => (
                      <div key={player.id} className="flex-shrink-0 flex flex-col items-center">
                        <div className="relative">
                          <Avatar className={`w-10 h-10 ring-2 ${
                            index === 0 ? 'ring-primary' : 
                            index === 1 ? 'ring-gray-400' : 
                            index === 2 ? 'ring-amber-600' : 'ring-muted'
                          }`}>
                            <AvatarImage src={player.photo} alt={player.name} />
                            <AvatarFallback>{index + 1}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-background border border-border rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold">{index + 1}</span>
                          </div>
                        </div>
                        <p className="text-xs font-medium text-center mt-1 truncate w-12">
                          {player.name?.split(' ').pop()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions modernes */}
              <div className="flex items-center justify-between p-4 pt-2 border-t border-border/50">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(top.id)}
                    className={`flex items-center gap-2 hover:bg-red-500/10 ${
                      top.isLiked ? 'text-red-500' : 'text-muted-foreground'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${top.isLiked ? 'fill-current' : ''}`} />
                    <span className="text-xs font-medium">{top.likes}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">{top.commentCount}</span>
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare(top)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-green-500 hover:bg-green-500/10"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-xs font-medium">{top.shares}</span>
                </Button>
              </div>
            </div>
          ))}

          {filteredTops.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg font-medium">Aucun top trouvé</p>
              <p className="text-muted-foreground/70 text-sm mt-1">
                {searchQuery ? "Essayez d'autres mots-clés" : "Soyez le premier à partager votre top !"}
              </p>
            </div>
          )}
        </div>

        {/* Footer avec stats */}
        <div className="px-6 py-4 border-t border-border/50 bg-muted/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{filteredTops.length} tops trouvés</span>
            <span>Ballon d'Or 2025</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}