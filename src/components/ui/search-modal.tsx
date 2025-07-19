import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, TrendingUp, User, Trophy, Hash, X } from "lucide-react";

interface SearchResult {
  id: string;
  type: "player" | "user" | "topic";
  title: string;
  subtitle?: string;
  avatar?: string;
  badge?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const trendingTopics = [
  "Mbappé Ballon d'Or",
  "Haaland stats",
  "Real Madrid",
  "Champions League",
  "Bellingham performance"
];

const recentSearches = [
  "Kylian Mbappé",
  "Classement 2025",
  "Votes communauté"
];

const searchResults: SearchResult[] = [
  {
    id: "1",
    type: "player",
    title: "Kylian Mbappé",
    subtitle: "Real Madrid • Attaquant",
    avatar: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop",
    badge: "#1"
  },
  {
    id: "2",
    type: "player",
    title: "Erling Haaland",
    subtitle: "Manchester City • Attaquant",
    avatar: "https://images.unsplash.com/photo-1556506751-69a7d6fb64dd?w=100&h=100&fit=crop",
    badge: "#2"
  },
  {
    id: "3",
    type: "user",
    title: "Sophie Martin",
    subtitle: "Fan de football • 1.2K followers",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop"
  },
  {
    id: "4",
    type: "topic",
    title: "Ballon d'Or 2025",
    subtitle: "2.3K discussions • Tendance"
  }
];

export const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query.length > 0) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        const filtered = searchResults.filter(result =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.subtitle?.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsSearching(false);
    }
  }, [query]);

  const getIcon = (type: string) => {
    switch (type) {
      case "player":
        return <Trophy className="w-5 h-5 text-primary" />;
      case "user":
        return <User className="w-5 h-5 text-blue-500" />;
      case "topic":
        return <Hash className="w-5 h-5 text-green-500" />;
      default:
        return <Search className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-hidden flex flex-col p-0">
        <DialogDescription className="sr-only">
          Recherchez des joueurs, posts ou discussions
        </DialogDescription>
        {/* Header de recherche */}
        <div className="p-4 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher joueurs, utilisateurs, sujets..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
            />
            {query && (
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0"
                onClick={clearSearch}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {query.length === 0 ? (
            <div className="p-4 space-y-6">
              {/* Recherches récentes */}
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recherches récentes
                </h3>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start h-auto p-2"
                      onClick={() => handleSearch(search)}
                    >
                      <Clock className="w-4 h-4 mr-3 text-muted-foreground" />
                      {search}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tendances */}
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Tendances
                </h3>
                <div className="space-y-2">
                  {trendingTopics.map((topic, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start h-auto p-2"
                      onClick={() => handleSearch(topic)}
                    >
                      <Hash className="w-4 h-4 mr-3 text-muted-foreground" />
                      {topic}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              {isSearching ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Recherche en cours...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm mb-3">
                    Résultats ({results.length})
                  </h3>
                  {results.map(result => (
                    <Button
                      key={result.id}
                      variant="ghost"
                      className="w-full h-auto p-3 justify-start"
                    >
                      <div className="flex items-center gap-3 w-full">
                        {result.avatar ? (
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={result.avatar} alt={result.title} />
                            <AvatarFallback>{result.title.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            {getIcon(result.type)}
                          </div>
                        )}
                        
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{result.title}</span>
                            {result.badge && (
                              <Badge className="bg-primary/10 text-primary text-xs">
                                {result.badge}
                              </Badge>
                            )}
                          </div>
                          {result.subtitle && (
                            <p className="text-xs text-muted-foreground">
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucun résultat trouvé</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Essayez avec d'autres mots-clés
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};