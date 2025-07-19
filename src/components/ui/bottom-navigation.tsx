import { Home, Trophy, Users, MessageCircle, User, Crown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useFeatureFlags } from "@/contexts/FeatureFlagsContext";

export const BottomNavigation = () => {
  const location = useLocation();
  const { flags } = useFeatureFlags();

  const navigationItems = [
    { icon: Home, label: "Accueil", path: "/" },
    ...(flags.showRanking ? [{ icon: Trophy, label: "Classement", path: "/ranking" }] : []),
    ...(flags.showLegends ? [{ icon: Crown, label: "Légendes", path: "/legends" }] : []),
    ...(flags.showClub ? [{ icon: Users, label: "Club", path: "/club" }] : []),
    ...(flags.showChat ? [{ icon: MessageCircle, label: "Chat", path: "/chat" }] : []),
    ...(flags.showMyTop ? [{ icon: Trophy, label: "MyTop", path: "/mytop" }] : []),
    { icon: User, label: "Profil", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/50 z-50">
      <div className="flex items-center justify-around py-2 px-1 max-w-md mx-auto">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon 
                size={24} 
                className={`transition-all duration-300 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span 
                className={`text-xs font-medium transition-all duration-300 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-scale-in" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};