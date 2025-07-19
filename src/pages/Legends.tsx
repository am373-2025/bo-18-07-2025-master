import { useState } from "react";
import { ArrowLeft, Plus, Heart, MessageCircle, Share2, Filter, Crown, Trophy, Users, Medal, MoreVertical, Edit3, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommentModal } from "@/components/ui/comment-modal";
import { PostActionsMenu } from "@/components/ui/post-actions-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Formation {
  id: string;
  title: string;
  league: string;
  author: {
    name: string;
    avatar: string;
    badge: "fan" | "media" | "player";
  };
  formation: string;
  players: {
    position: string;
    name: string;
    club: string;
    era: string;
  }[];
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
  description: string;
}

const mockFormations: Formation[] = [
  {
    id: "1",
    title: "Le 4-3-3 Légendaire de la Premier League",
    league: "Premier League",
    author: {
      name: "Alex_Football",
      avatar: "/placeholder.svg",
      badge: "fan"
    },
    formation: "4-3-3",
    players: [
      { position: "GK", name: "Peter Schmeichel", club: "Manchester United", era: "90s" },
      { position: "RB", name: "Gary Neville", club: "Manchester United", era: "90s-00s" },
      { position: "CB", name: "John Terry", club: "Chelsea", era: "00s-10s" },
      { position: "CB", name: "Rio Ferdinand", club: "Manchester United", era: "00s-10s" },
      { position: "LB", name: "Ashley Cole", club: "Arsenal/Chelsea", era: "00s-10s" },
      { position: "CM", name: "Roy Keane", club: "Manchester United", era: "90s-00s" },
      { position: "CM", name: "Frank Lampard", club: "Chelsea", era: "00s-10s" },
      { position: "CM", name: "Steven Gerrard", club: "Liverpool", era: "00s-10s" },
      { position: "RW", name: "Cristiano Ronaldo", club: "Manchester United", era: "00s" },
      { position: "ST", name: "Alan Shearer", club: "Newcastle", era: "90s-00s" },
      { position: "LW", name: "Ryan Giggs", club: "Manchester United", era: "90s-00s" }
    ],
    likes: 1247,
    comments: 89,
    isLiked: false,
    createdAt: "2024-01-15",
    description: "Ma sélection du meilleur XI de tous les temps en Premier League. Des légendes qui ont marqué l'histoire du football anglais."
  },
  {
    id: "2",
    title: "Dream Team La Liga - L'Époque Dorée",
    league: "La Liga",
    author: {
      name: "Marca_Sport",
      avatar: "/placeholder.svg",
      badge: "media"
    },
    formation: "4-2-3-1",
    players: [
      { position: "GK", name: "Iker Casillas", club: "Real Madrid", era: "00s-10s" },
      { position: "RB", name: "Dani Alves", club: "Barcelona", era: "00s-10s" },
      { position: "CB", name: "Sergio Ramos", club: "Real Madrid", era: "00s-10s-20s" },
      { position: "CB", name: "Carles Puyol", club: "Barcelona", era: "00s-10s" },
      { position: "LB", name: "Roberto Carlos", club: "Real Madrid", era: "90s-00s" },
      { position: "CDM", name: "Sergio Busquets", club: "Barcelona", era: "00s-10s-20s" },
      { position: "CDM", name: "Xavi", club: "Barcelona", era: "00s-10s" },
      { position: "CAM", name: "Andrés Iniesta", club: "Barcelona", era: "00s-10s" },
      { position: "RW", name: "Lionel Messi", club: "Barcelona", era: "00s-10s-20s" },
      { position: "ST", name: "Raúl", club: "Real Madrid", era: "90s-00s-10s" },
      { position: "LW", name: "Ronaldinho", club: "Barcelona", era: "00s" }
    ],
    likes: 2156,
    comments: 134,
    isLiked: true,
    createdAt: "2024-01-12",
    description: "L'équipe type La Liga selon nos experts. Un mélange parfait entre le génie barcelonais et la grandeur madrilène."
  }
];

const getBadgeInfo = (badge: string) => {
  switch (badge) {
    case "fan":
      return { icon: Heart, color: "bg-red-500", label: "Fan" };
    case "media":
      return { icon: Trophy, color: "bg-blue-500", label: "Média" };
    case "player":
      return { icon: Medal, color: "bg-primary", label: "Joueur Pro" };
    default:
      return { icon: Users, color: "bg-muted", label: "Membre" };
  }
};

const Legends = () => {
  const [formations, setFormations] = useState<Formation[]>(mockFormations);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedLeague, setSelectedLeague] = useState<string>("all");
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFormation, setEditingFormation] = useState<Formation | null>(null);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    league: "",
    formation: ""
  });
  const { toast } = useToast();

  const leagues = ["all", "Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1"];
  const filters = [
    { id: "all", label: "Tous", icon: Crown },
    { id: "fan", label: "Fans", icon: Heart },
    { id: "media", label: "Médias", icon: Trophy },
    { id: "player", label: "Joueurs Pro", icon: Medal }
  ];

  const filteredFormations = formations.filter(formation => {
    const matchesFilter = selectedFilter === "all" || formation.author.badge === selectedFilter;
    const matchesLeague = selectedLeague === "all" || formation.league === selectedLeague;
    return matchesFilter && matchesLeague;
  });

  const handleLike = (formationId: string) => {
    setFormations(prev => prev.map(formation => 
      formation.id === formationId 
        ? { 
            ...formation, 
            isLiked: !formation.isLiked,
            likes: formation.isLiked ? formation.likes - 1 : formation.likes + 1
          }
        : formation
    ));
  };

  const handleComment = (formation: Formation) => {
    setSelectedFormation(formation);
    setCommentModalOpen(true);
  };

  const handleCreateFormation = () => {
    if (createForm.title.trim() && createForm.description.trim() && createForm.league && createForm.formation) {
      const newFormation: Formation = {
        id: Date.now().toString(),
        title: createForm.title,
        description: createForm.description,
        league: createForm.league,
        author: {
          name: "Vous",
          avatar: "/placeholder.svg",
          badge: "fan"
        },
        formation: createForm.formation,
        players: [], // Empty for now - would be filled via a form
        likes: 0,
        comments: 0,
        isLiked: false,
        createdAt: "maintenant"
      };
      
      setFormations([newFormation, ...formations]);
      setCreateForm({ title: "", description: "", league: "", formation: "" });
      setShowCreateModal(false);
      toast({
        title: "Formation créée !",
        description: "Votre formation légendaire a été publiée."
      });
    }
  };

  const handleEditFormation = (formation: Formation) => {
    setEditingFormation(formation);
    setCreateForm({
      title: formation.title,
      description: formation.description,
      league: formation.league,
      formation: formation.formation
    });
    setShowCreateModal(true);
  };

  const handleUpdateFormation = () => {
    if (editingFormation && createForm.title.trim()) {
      setFormations(formations.map(f => 
        f.id === editingFormation.id 
          ? { ...f, ...createForm }
          : f
      ));
      setEditingFormation(null);
      setCreateForm({ title: "", description: "", league: "", formation: "" });
      setShowCreateModal(false);
      toast({
        title: "Formation modifiée !",
        description: "Votre formation a été mise à jour."
      });
    }
  };

  const handleDeleteFormation = (formationId: string) => {
    setFormations(formations.filter(f => f.id !== formationId));
    toast({
      title: "Formation supprimée !",
      description: "Votre formation a été supprimée avec succès.",
      variant: "destructive"
    });
  };

  const handleFavoriteFormation = (formationId: string) => {
    // For now, just show a toast - this would be implemented with backend
    toast({
      title: "Formation favorite",
      description: "Formation ajoutée à vos favoris"
    });
  };

  const handleReportFormation = (formationId: string) => {
    toast({
      title: "Formation signalée",
      description: "Cette formation a été signalée aux modérateurs"
    });
  };

  const handleShareFormation = (formation: Formation) => {
    toast({
      title: "Formation partagée",
      description: "Le lien de partage a été copié"
    });
  };

  const getFormationLayout = (formation: string, players: Formation['players']) => {
    const layouts: Record<string, number[]> = {
      "4-3-3": [1, 4, 3, 3],
      "4-2-3-1": [1, 4, 2, 3, 1],
      "3-5-2": [1, 3, 5, 2],
      "4-4-2": [1, 4, 4, 2]
    };

    const layout = layouts[formation] || [1, 4, 3, 3];
    let playerIndex = 0;
    
    return layout.map((count, lineIndex) => {
      const lineClasses = {
        0: "justify-center", // GK
        1: "justify-between", // Defense
        2: count === 2 ? "justify-around" : "justify-between", // Milieu
        3: count === 3 ? "justify-between" : "justify-around", // Attaque
        4: "justify-center" // Attaque centrale
      };

      const linePlayers = players.slice(playerIndex, playerIndex + count);
      playerIndex += count;

      return (
        <div key={lineIndex} className={`flex ${lineClasses[lineIndex as keyof typeof lineClasses]} w-full`}>
          {linePlayers.map((player, idx) => (
            <div key={idx} className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mb-1">
                <span className="text-xs font-bold text-primary">{player.position}</span>
              </div>
              <p className="text-xs font-semibold text-foreground truncate w-16">{player.name.split(' ').pop()}</p>
              <p className="text-xs text-muted-foreground truncate w-16">{player.era}</p>
            </div>
          ))}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <Link to="/" className="p-2 hover:bg-muted/50 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex items-center gap-2">
            <Crown className="text-primary" size={24} />
            <h1 className="text-xl font-bold text-gradient-gold">Légendes</h1>
          </div>
          <Button size="sm" className="btn-golden" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} className="mr-1" />
            Créer
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 space-y-4 max-w-md mx-auto">
        <Tabs value={selectedFilter} onValueChange={setSelectedFilter}>
          <TabsList className="grid w-full grid-cols-4">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <TabsTrigger 
                  key={filter.id} 
                  value={filter.id} 
                  className="flex items-center gap-1 text-xs"
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{filter.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {leagues.map((league) => (
            <Button
              key={league}
              variant={selectedLeague === league ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLeague(league)}
              className="whitespace-nowrap text-xs"
            >
              {league === "all" ? "Toutes les ligues" : league}
            </Button>
          ))}
        </div>
      </div>

      {/* Formations List */}
      <div className="px-4 space-y-4 max-w-md mx-auto">
        {filteredFormations.map((formation) => {
          const badgeInfo = getBadgeInfo(formation.author.badge);
          const BadgeIcon = badgeInfo.icon;

          return (
            <Card key={formation.id} className="card-golden p-4 space-y-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={formation.author.avatar} />
                  <AvatarFallback>{formation.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{formation.author.name}</h3>
                    <Badge className={`${badgeInfo.color} text-white text-xs px-2 py-0.5`}>
                      <BadgeIcon size={10} className="mr-1" />
                      {badgeInfo.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{formation.createdAt}</p>
                </div>
                <PostActionsMenu
                  postId={formation.id}
                  isOwnPost={formation.author.name === "Vous"}
                  onEdit={() => handleEditFormation(formation)}
                  onDelete={() => handleDeleteFormation(formation.id)}
                  onFavorite={() => handleFavoriteFormation(formation.id)}
                  onReport={() => handleReportFormation(formation.id)}
                  onShare={() => handleShareFormation(formation)}
                  isFavorited={false}
                  isReported={false}
                />
              </div>

              {/* Formation Title */}
              <div>
                <h2 className="font-bold text-lg text-gradient-gold">{formation.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {formation.league}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {formation.formation}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground">{formation.description}</p>

              {/* Formation Display */}
              <div className="bg-gradient-to-b from-green-500/10 to-green-600/20 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30 bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
                <div className="relative space-y-6">
                  {getFormationLayout(formation.formation, formation.players)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(formation.id)}
                    className={`flex items-center gap-2 ${formation.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                  >
                    <Heart 
                      size={16} 
                      className={formation.isLiked ? 'fill-current' : ''}
                    />
                    <span className="text-xs">{formation.likes}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleComment(formation)}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <MessageCircle size={16} />
                    <span className="text-xs">{formation.comments}</span>
                  </Button>
                </div>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground"
                  onClick={() => handleShareFormation(formation)}
                >
                  <Share2 size={16} />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Comment Modal */}
      {selectedFormation && (
        <CommentModal 
          isOpen={commentModalOpen}
          onClose={() => setCommentModalOpen(false)}
          postId={selectedFormation.id}
        />
      )}

      {/* Recommendations Section */}
      <div className="mt-8 px-4 max-w-md mx-auto">
        <Card className="card-golden p-4">
          <h3 className="font-bold text-lg text-gradient-gold mb-3 flex items-center gap-2">
            <Crown size={20} />
            Recommandations
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Partagez vos formations légendaires par ligue</p>
            <p>• Débattez avec la communauté sur les meilleurs joueurs</p>
            <p>• Découvrez les sélections des experts et joueurs pro</p>
            <p>• Votez pour vos formations favorites</p>
          </div>
        </Card>
      </div>

      {/* Create Formation Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="card-golden max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-gradient-gold">
              {editingFormation ? "Modifier la formation" : "Créer une formation légendaire"}
            </DialogTitle>
            <DialogDescription>
              Partagez votre XI de légende avec la communauté
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Titre</label>
              <Input
                placeholder="Ex: Le 4-3-3 Légendaire de la Premier League"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Ligue</label>
              <Select value={createForm.league} onValueChange={(value) => setCreateForm({ ...createForm, league: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choisir une ligue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Premier League">Premier League</SelectItem>
                  <SelectItem value="La Liga">La Liga</SelectItem>
                  <SelectItem value="Serie A">Serie A</SelectItem>
                  <SelectItem value="Bundesliga">Bundesliga</SelectItem>
                  <SelectItem value="Ligue 1">Ligue 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Formation</label>
              <Select value={createForm.formation} onValueChange={(value) => setCreateForm({ ...createForm, formation: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choisir une formation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4-3-3">4-3-3</SelectItem>
                  <SelectItem value="4-2-3-1">4-2-3-1</SelectItem>
                  <SelectItem value="3-5-2">3-5-2</SelectItem>
                  <SelectItem value="4-4-2">4-4-2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Décrivez votre sélection et pourquoi ces joueurs sont légendaires..."
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingFormation(null);
                  setCreateForm({ title: "", description: "", league: "", formation: "" });
                }}
              >
                Annuler
              </Button>
              <Button
                className="flex-1 btn-golden"
                onClick={editingFormation ? handleUpdateFormation : handleCreateFormation}
              >
                {editingFormation ? "Modifier" : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Legends;