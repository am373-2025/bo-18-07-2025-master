import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { 
  Settings, 
  Bell, 
  Moon, 
  Sun, 
  Shield, 
  Lock, 
  Database,
  Trash2,
  LogOut,
  User,
  Mail
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const handleToggleNotifications = () => {
    setNotifications(!notifications);
    toast({
      title: notifications ? "Notifications désactivées" : "Notifications activées",
      description: "Vos préférences ont été mises à jour."
    });
  };

  const handleToggleDarkMode = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    // toast supprimé : ne plus afficher de notification lors du changement de thème
  };

  const handleToggleAutoSave = () => {
    setAutoSave(!autoSave);
    toast({
      title: autoSave ? "Sauvegarde automatique désactivée" : "Sauvegarde automatique activée",
      description: "Paramètre mis à jour avec succès."
    });
  };

  const handleToggleAnalytics = () => {
    setAnalytics(!analytics);
    toast({
      title: analytics ? "Analytics désactivées" : "Analytics activées",
      description: "Préférences de collecte de données mises à jour."
    });
  };

  const handlePasswordChange = () => {
    toast({
      title: "Changement de mot de passe",
      description: "Un email vous sera envoyé pour modifier votre mot de passe."
    });
  };

  const handleDataExport = () => {
    toast({
      title: "Export des données",
      description: "Vos données seront exportées et envoyées par email."
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Suppression de compte",
      description: "Cette action nécessite une confirmation par email.",
      variant: "destructive"
    });
  };

  const handleLogout = () => {
    toast({
      title: "Déconnexion",
      description: "À bientôt ! Vous avez été déconnecté."
    });
    onClose();
    // Déclencher l'affichage de la modal de connexion via un event
    window.dispatchEvent(new CustomEvent('showLoginModal'));
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent("Demande d'aide - Ballon d'Or 2025");
    const body = encodeURIComponent("Bonjour,\n\nJ'ai besoin d'aide concernant :\n\n[Décrivez votre demande]\n\nCordialement");
    window.open(`mailto:support@ballondor2025.com?subject=${subject}&body=${body}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gradient-gold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Paramètres
          </DialogTitle>
          <DialogDescription>
            Gérez vos préférences et paramètres de l'application
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Préférences générales */}
          <Card className="card-golden">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-gradient-gold flex items-center gap-2">
                <User className="w-5 h-5" />
                Préférences générales
              </h3>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">Notifications push</div>
                    <div className="text-xs text-muted-foreground">Recevoir les alertes</div>
                  </div>
                </div>
                <Switch checked={notifications} onCheckedChange={handleToggleNotifications} />
              </div>

              {/* Mode sombre */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === "dark" ? (
                    <Moon className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Sun className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <div className="font-medium text-sm">Mode sombre</div>
                    <div className="text-xs text-muted-foreground">Apparence de l'app</div>
                  </div>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={handleToggleDarkMode} />
              </div>

              {/* Sauvegarde automatique */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">Sauvegarde auto</div>
                    <div className="text-xs text-muted-foreground">Sauvegarder automatiquement</div>
                  </div>
                </div>
                <Switch checked={autoSave} onCheckedChange={handleToggleAutoSave} />
              </div>
            </CardContent>
          </Card>

          {/* Confidentialité */}
          <Card className="card-golden">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-gradient-gold flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Confidentialité & Sécurité
              </h3>

              {/* Analytics */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">Analytics</div>
                    <div className="text-xs text-muted-foreground">Partager données d'usage</div>
                  </div>
                </div>
                <Switch checked={analytics} onCheckedChange={handleToggleAnalytics} />
              </div>

              {/* Changer mot de passe */}
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handlePasswordChange}
              >
                <Lock className="w-5 h-5 mr-3" />
                Changer le mot de passe
              </Button>

              {/* Export des données */}
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleDataExport}
              >
                <Database className="w-5 h-5 mr-3" />
                Exporter mes données
              </Button>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="card-golden">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-gradient-gold flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Support & Aide
              </h3>

              <Button 
                className="btn-golden w-full" 
                onClick={handleContactSupport}
              >
                <Mail className="w-4 h-4 mr-2" />
                Contacter le support
              </Button>
            </CardContent>
          </Card>

          {/* Actions dangereuses */}
          <Card className="border-destructive/20">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-destructive flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Zone de danger
              </h3>

              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10" 
                  onClick={handleDeleteAccount}
                >
                  <Trash2 className="w-5 h-5 mr-3" />
                  Supprimer le compte
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Se déconnecter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};