import { useState } from "react";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface SearchAndFiltersProps {
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  filterOptions?: {
    position?: FilterOption[];
    league?: FilterOption[];
    club?: FilterOption[];
    age?: FilterOption[];
  };
  className?: string;
}

export const SearchAndFilters = ({
  searchPlaceholder = "Rechercher...",
  onSearch,
  onFilterChange,
  filterOptions = {},
  className
}: SearchAndFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleFilterUpdate = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
    onFilterChange?.({});
  };

  const activeFiltersCount = Object.keys(filters).length;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-12"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSearchChange("")}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filter Toggle & Active Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-80 p-0" align="start">
            <Card className="border-0 shadow-none">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Filtres</h3>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-xs"
                    >
                      Tout effacer
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Position Filter */}
                {filterOptions.position && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Position</label>
                    <Select
                      value={filters.position || ""}
                      onValueChange={(value) => handleFilterUpdate("position", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Toutes les positions" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions.position.map((option) => (
                          <SelectItem key={option.id} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* League Filter */}
                {filterOptions.league && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Championnat</label>
                    <Select
                      value={filters.league || ""}
                      onValueChange={(value) => handleFilterUpdate("league", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Tous les championnats" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions.league.map((option) => (
                          <SelectItem key={option.id} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Club Filter */}
                {filterOptions.club && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Club</label>
                    <Select
                      value={filters.club || ""}
                      onValueChange={(value) => handleFilterUpdate("club", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Tous les clubs" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions.club.map((option) => (
                          <SelectItem key={option.id} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Age Filter */}
                {filterOptions.age && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tranche d'âge</label>
                    <div className="space-y-2">
                      {filterOptions.age.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={option.id}
                            checked={filters.age?.includes(option.value)}
                            onCheckedChange={(checked) => {
                              const currentAges = filters.age || [];
                              const newAges = checked
                                ? [...currentAges, option.value]
                                : currentAges.filter((age: string) => age !== option.value);
                              handleFilterUpdate("age", newAges.length > 0 ? newAges : undefined);
                            }}
                          />
                          <label htmlFor={option.id} className="text-sm">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </PopoverContent>
        </Popover>

        {/* Active Filter Badges */}
        {Object.entries(filters).map(([key, value]) => {
          if (!value) return null;
          
          const displayValue = Array.isArray(value) ? value.join(", ") : value;
          const filterOption = filterOptions[key as keyof typeof filterOptions];
          const label = filterOption?.find(opt => opt.value === value)?.label || displayValue;
          
          return (
            <Badge
              key={key}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <span className="text-xs">{label}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter(key)}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          );
        })}
      </div>
    </div>
  );
};