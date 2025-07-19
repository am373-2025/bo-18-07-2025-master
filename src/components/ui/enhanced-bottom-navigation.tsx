import { Link, useLocation } from "react-router-dom";
import { Home, TrendingUp, Crown, MessageCircle, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/useResponsive";

interface NavItem {
  path: string;
  icon: React.ComponentType<any>;
  label: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { path: "/", icon: Home, label: "Accueil" },
  { path: "/ranking", icon: TrendingUp, label: "Classement" },
  { path: "/legends", icon: Crown, label: "Légendes" },
  { path: "/chat", icon: MessageCircle, label: "Chat", badge: 2 },
  { path: "/profile", icon: User, label: "Profil" }
];

export const EnhancedBottomNavigation = () => {
  const location = useLocation();
  const { isMobile } = useResponsive();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/50 animate-slide-up"
    >
      <div className="max-w-md mx-auto flex justify-around items-center py-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <div className="relative">
                <Icon 
                  size={isMobile ? 20 : 24} 
                  className={cn(
                    "transition-colors",
                    active && "drop-shadow-[0_0_6px_hsl(var(--primary))]"
                  )}
                />
                
                {item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                  >
                    {item.badge}
                  </Badge>
                )}
                
                {active && (
                  <div
                    className="absolute -bottom-1 left-1/2 w-1 h-1 bg-primary rounded-full transform -translate-x-1/2 animate-scale-in"
                  />
                )}
              </div>
              
              <span className={cn(
                "text-xs mt-1 transition-colors",
                isMobile ? "text-[10px]" : "text-xs",
                active ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
        {/* Ajout de l'entrée MyTop */}
        <Link
          to="/mytop"
          className={cn(
            "relative flex flex-col items-center p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95",
            isActive("/mytop")
              ? "text-primary" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <div className="relative">
            <span className="text-2xl">🏆</span>
          </div>
          <span className={cn(
            "text-xs mt-1 transition-colors",
            isMobile ? "text-[10px]" : "text-xs",
            isActive("/mytop") ? "text-primary font-medium" : "text-muted-foreground"
          )}>
            MyTop
          </span>
        </Link>
      </div>
    </nav>
  );
};