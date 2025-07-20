import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import ballonDorIcon from "@/assets/ballon-dor-icon.png";

interface SplashScreenProps {
  onFinish: () => void;
  supabaseStatus?: boolean | null;
}

export const SplashScreen = ({ onFinish, supabaseStatus }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState("Initialisation...");

  useEffect(() => {
    const statusMessages = [
      "Connexion aux serveurs...",
      "Vérification de Supabase...",
      "Chargement des données...",
      "Configuration de l'interface...",
      "Finalisation..."
    ];
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 500); // Délai avant de finir
          return 100;
        }
        
        const newProgress = prev + 3;
        const statusIndex = Math.floor(newProgress / 20);
        if (statusIndex < statusMessages.length) {
          setCurrentStatus(statusMessages[statusIndex]);
        }
        
        return newProgress;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onFinish]);
  
  useEffect(() => {
    if (supabaseStatus !== null) {
      setCurrentStatus(
        supabaseStatus 
          ? "✅ Base de données connectée" 
          : "⚠️ Mode hors ligne activé"
      );
    }
  }, [supabaseStatus]);

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
          <p className="text-sm text-muted-foreground">
            {currentStatus}
          </p>
          {supabaseStatus !== null && (
            <div className="flex items-center justify-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${supabaseStatus ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className={supabaseStatus ? 'text-green-600' : 'text-yellow-600'}>
                {supabaseStatus ? 'Base de données' : 'Mode local'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};