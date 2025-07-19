import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import ballonDorIcon from "@/assets/ballon-dor-icon.png";

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 500); // Délai avant de finir
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="text-center space-y-8 animate-fade-in">
        {/* Logo animé */}
        <div className="relative">
          <img 
            src={ballonDorIcon} 
            alt="Ballon d'Or 2025" 
            className="w-32 h-32 mx-auto animate-float"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full opacity-20 animate-glow" />
        </div>

        {/* Titre */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gradient-gold">
            Ballon d'Or
          </h1>
          <p className="text-2xl font-light text-primary">2025</p>
          <p className="text-sm text-muted-foreground">
            L'application officielle
          </p>
        </div>

        {/* Barre de progression */}
        <div className="w-64 mx-auto space-y-3">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Chargement... {progress}%
          </p>
        </div>

        {/* Messages de chargement */}
        <div className="space-y-2 animate-pulse">
          {progress < 30 && (
            <p className="text-sm text-muted-foreground">
              Connexion aux serveurs...
            </p>
          )}
          {progress >= 30 && progress < 60 && (
            <p className="text-sm text-muted-foreground">
              Chargement des favoris...
            </p>
          )}
          {progress >= 60 && progress < 90 && (
            <p className="text-sm text-muted-foreground">
              Synchronisation des votes...
            </p>
          )}
          {progress >= 90 && (
            <p className="text-sm text-primary font-medium">
              Prêt ! ⚽
            </p>
          )}
        </div>
      </div>
    </div>
  );
};