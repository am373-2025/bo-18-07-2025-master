import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter, Users, PlayCircle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HomeFiltersProps {
  onFilterChange: (filter: string) => void;
  activeFilter: string;
}

export const HomeFilters = ({ onFilterChange, activeFilter }: HomeFiltersProps) => {
  const { toast } = useToast();

  const filters = [
    {
      id: "all",
      name: "Tous",
      icon: Users,
      count: 156
    }
  ];

  const handleFilterClick = (filterId: string) => {
    onFilterChange(filterId);
    
    const filter = filters.find(f => f.id === filterId);
    toast({
      title: `Filtre "${filter?.name}" activé`,
      description: `${filter?.count} joueurs correspondants trouvés`
    });
  };

  return (
    <div>
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.id;
        
        return (
          <Button
            key={filter.id}
            size="sm"
            variant={isActive ? "default" : "outline"}
            className={`whitespace-nowrap ${
              isActive ? "btn-golden" : "btn-golden-outline"
            }`}
            onClick={() => handleFilterClick(filter.id)}
          >
            <Icon className="w-4 h-4 mr-2" />
            {filter.name}
            <Badge 
              variant="secondary" 
              className="ml-2 text-xs bg-muted text-muted-foreground"
            >
              {filter.count}
            </Badge>
          </Button>
        );
      })}
      
      <Button size="sm" variant="ghost" onClick={() => {
        toast({
          title: "Filtres avancés",
          description: "Options de tri et filtrage détaillé (bientôt disponible)"
        });
      }}>
        <Filter className="w-4 h-4" />
      </Button>
    </div>
  );
};