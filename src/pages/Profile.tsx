import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { AvatarUploadModal } from "@/components/ui/avatar-upload-modal";
import { SettingsModal } from "@/components/ui/settings-modal";
import { LoginModal } from "@/components/ui/login-modal";
import { FeatureFlagsModal } from "@/components/ui/feature-flags-modal";
import { useFeatureFlags } from "@/contexts/FeatureFlagsContext";
import { createTestAdmin, getAdminProfile } from "@/utils/adminTest";
import { 
  User, 
  Settings, 
  Edit3, 
  Users, 
  Heart, 
  Trophy, 
  Bell, 
  Lock, 
  Trash2, 
  Flag, 
  Moon, 
  Sun,
  LogOut,
  Mail,
  Shield,
  Crown
} from "lucide-react";
import { ChangePasswordModal } from "@/components/ui/change-password-modal";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { PlayerCard } from "@/components/ui/player-card";

export default function Profile() {
  const { user, logout, isAuthenticated } = useAuth();
  const { profile, loading, updateProfile, error: profileError } = useProfile();
  const [notifications, setNotifications] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFeatureFlagsModal, setShowFeatureFlagsModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const { flags, isAdmin, setIsAdmin } = useFeatureFlags();
  const [adminProfile, setAdminProfile] = useState(getAdminProfile());
  const [editForm, setEditForm] = useState({
    name: "",
    bio: ""
  });
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: playersData } = useSupabaseTable('players');
  const [favoritePlayers, setFavoritePlayers] = useState<any[]>([]);

  // Initialize edit form when profile loads
  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        bio: profile.bio || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    async function fetchFavorites() {
      if (user) {
        const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
        const userFavorites = favorites.filter((fav: any) => fav.user_id === user.id);
        const players = JSON.parse(localStorage.getItem('table_players') || '[]');
        const favoritePlayersList = userFavorites.map((fav: any) => 
          players.find((p: any) => p.id === fav.player_id)
        ).filter(Boolean);
        setFavoritePlayers(favoritePlayersList);
      }
    }
    fetchFavorites();
  }, [user]);

  const handleSaveProfile = async () => {
    if (profile) {
      try {
        await updateProfile({
          name: editForm.name,
          bio: editForm.bio
        });
        setEditingProfile(false);
        toast({
          title: "Profil mis à jour !",
          description: "Vos informations ont été sauvegardées.",
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder le profil.",
          variant: "destructive"
        });
      }
    }
  };

  const handleAvatarChange = async (newAvatar: string) => {
    try {
      await updateProfile({ avatar: newAvatar });
      toast({
        title: "Avatar mis à jour !",
        description: "Votre photo de profil a été modifiée."
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'avatar.",
        variant: "destructive"
      });
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const newAvatar = event.target?.result as string;
        await handleAvatarChange(newAvatar);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowLoginModal(true);
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la déconnexion",
        variant: "destructive"
      });
    }
  };
        name: editForm.name,
        bio: editForm.bio
      });
      // Recharge le profil depuis Supabase pour garantir la persistance
      const updatedProfile = await getCurrentProfile();
      setUser(updatedProfile);
      setEditingProfile(false);
      toast({
        title: "Profil mis à jour !",
        description: "Vos informations ont été sauvegardées.",
      });
    }
  };

  const handleToggleNotifications = () => {
    setNotifications(!notifications);
    toast({
      title: notifications ? "Notifications désactivées" : "Notifications activées",
      description: "Vos préférences ont été mises à jour.",
    });
  };

  const handleToggleDarkMode = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    // toast supprimé : ne plus afficher de notification lors du changement de thème
  };

  const handlePasswordChange = () => {
    setShowChangePasswordModal(true);
  };

  // Fonction pour gérer la soumission du changement de mot de passe
  const handlePasswordChangeSubmit = async (current: string, next: string) => {
    // Remplacer par un appel API réel
    await new Promise((resolve) => setTimeout(resolve, 1200));
    if (current !== "password123") {
      throw new Error("Mot de passe actuel incorrect.");
    }
    // Succès simulé
  };

  const handleReportProblem = () => {
    const subject = encodeURIComponent("Signalement - Ballon d'Or 2025");
    const body = encodeURIComponent("Bonjour,\n\nJe souhaite signaler le problème suivant :\n\n[Décrivez votre problème]\n\nCordialement");
    window.open(`mailto:support@ballondor2025.com?subject=${subject}&body=${body}`);
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Suppression de compte",
      description: "Cette action nécessite une confirmation par email.",
    });
  };

  const handleCreateTestAdmin = () => {
    const result = createTestAdmin();
    setIsAdmin(true);
    setAdminProfile(result.profile);
    toast({
      title: "Compte Admin Créé",
      description: `${result.message} - Email: ${result.credentials.email}`,
    });
  };

  const handleToggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      setAdminProfile(null);
      toast({
        title: "Mode Admin Désactivé",
        description: "Vous n'êtes plus en mode administrateur",
      });
    } else {
      handleCreateTestAdmin();
    }
  };

  const handleLogout = async () => {
    // Clear localStorage instead of Supabase logout
    localStorage.removeItem('currentUserProfile');
    setUser(null);
    setShowLoginModal(true);
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès"
    });
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent("Demande d'aide - Ballon d'Or 2025");
    const body = encodeURIComponent("Bonjour,\n\nJ'ai besoin d'aide concernant :\n\n[Décrivez votre demande]\n\nCordialement");
    window.open(`mailto:support@ballondor2025.com?subject=${subject}&body=${body}`);
  };

  // Handler pour changer l'avatar via fichier local
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const newAvatar = event.target?.result as string;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated || !user) {
    setTimeout(() => setShowLoginModal(true), 0);
    return (
      <>
        {showLoginModal && (
          <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        )}
        <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Veuillez vous connecter pour accéder à votre profil.</p>
          </div>
        </div>
      </>
    );
  }

  // Show profile not found
  if (!profile && !loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Profil non trouvé.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-primary animate-float" />
            <h1 className="text-2xl font-bold text-gradient-gold">Profil</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost"
              onClick={handleToggleDarkMode}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6 animate-fade-in">
        {/* Profil principal */}
        <Card className="card-golden">
          <CardContent className="p-6 text-center space-y-4">
            <div className="relative inline-block">
              <Avatar className="w-24 h-24 mx-auto ring-4 ring-primary/20 cursor-pointer" onClick={() => setShowAvatarModal(true)}>
                <AvatarImage src={profile?.avatar} alt={profile?.name} />
                <AvatarFallback className="text-2xl">{profile?.name?.slice(0, 2) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-glow">
                <Trophy className="w-4 h-4 text-primary-foreground" />
              </div>
              <Button
                size="sm"
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full btn-golden text-black shadow-lg border-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleAvatarFileChange}
              />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gradient-gold">{profile?.name}</h2>
              <p className="text-sm text-muted-foreground">{profile?.username}</p>
              <p className="text-sm leading-relaxed">{profile?.bio}</p>
              <p className="text-xs text-muted-foreground">{profile?.joinDate}</p>
            </div>

            <div className="flex justify-center gap-6">
              <div className="text-center">
                <div className="font-bold text-lg text-primary">{profile?.followers?.toLocaleString() || 0}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-primary">{profile?.following || 0}</div>
                <div className="text-xs text-muted-foreground">Suivi</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-primary">{profile?.stats?.votes || 0}</div>
                <div className="text-xs text-muted-foreground">Votes</div>
              </div>
            </div>

            <Dialog open={editingProfile} onOpenChange={setEditingProfile}>
              <DialogTrigger asChild>
                <Button className="btn-golden w-full">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Modifier le profil
                </Button>
              </DialogTrigger>
              <DialogContent className="card-golden max-w-sm mx-auto">
                <DialogHeader>
                  <DialogTitle className="text-gradient-gold">Modifier le profil</DialogTitle>
                  <DialogDescription>
                    Modifiez vos informations personnelles
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nom</label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setEditingProfile(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      className="flex-1 btn-golden"
                      onClick={handleSaveProfile}
                    >
                      Sauvegarder
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Paramètres */}
        <Card className="card-golden">
          <CardHeader>
            <h3 className="font-semibold text-gradient-gold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Paramètres
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Admin Features */}
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <span className="font-medium">Mode Administrateur</span>
                </div>
                <Switch 
                  checked={isAdmin} 
                  onCheckedChange={handleToggleAdmin}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {isAdmin ? 'Mode admin activé' : 'Activer le mode administrateur'}
              </p>
              {adminProfile && (
                <div className="mt-2 text-xs text-primary">
                  Admin: {adminProfile.name} ({adminProfile.email})
                </div>
              )}
            </div>

            {isAdmin && (
              <Button
                onClick={() => setShowFeatureFlagsModal(true)}
                className="w-full btn-golden"
                aria-haspopup="dialog"
                aria-controls="feature-flags-modal"
              >
                <Crown className="w-4 h-4 mr-2" />
                Gérer les Features Flags
              </Button>
            )}

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">Notifications</div>
                  <div className="text-xs text-muted-foreground">Recevoir les alertes</div>
                </div>
              </div>
              <Switch checked={notifications} onCheckedChange={handleToggleNotifications} />
            </div>

            {/* Divider */}
            <div className="border-t border-border/50 my-4" />

            {/* Changer mot de passe */}
            <Button variant="outline" className="w-full justify-start" onClick={handlePasswordChange}>
              <Lock className="w-5 h-5 mr-3" />
              Changer le mot de passe
            </Button>

            {/* Signaler un problème */}
            <Button variant="outline" className="w-full justify-start" onClick={handleReportProblem}>
              <Flag className="w-5 h-5 mr-3" />
              Signaler un problème
            </Button>

            {/* Divider */}
            <div className="border-t border-border/50 my-4" />

            {/* Actions dangereuses */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10" onClick={handleDeleteAccount}>
                <Trash2 className="w-5 h-5 mr-3" />
                Supprimer le compte
              </Button>

              <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="w-5 h-5 mr-3" />
                Se déconnecter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact admin */}
        <Card className="card-golden">
          <CardContent className="p-4 text-center space-y-3">
            <Shield className="w-12 h-12 text-primary mx-auto animate-glow" />
            <h3 className="font-bold text-gradient-gold">
              Besoin d'aide ?
            </h3>
            <p className="text-sm text-muted-foreground">
              Contactez notre équipe support pour toute question
            </p>
            <Button className="btn-golden w-full" onClick={handleContactSupport}>
              <Mail className="w-4 h-4 mr-2" />
              Contacter le support
            </Button>
          </CardContent>
        </Card>

        <AvatarUploadModal
          isOpen={showAvatarModal}
          onClose={() => setShowAvatarModal(false)}
          currentAvatar={profile?.avatar || ''}
          onAvatarChange={handleAvatarChange}
        />
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          onPasswordChange={handlePasswordChangeSubmit}
        />
        
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
        
        <FeatureFlagsModal
          open={showFeatureFlagsModal}
          onOpenChange={open => setShowFeatureFlagsModal(!!open)}
        />
      </main>
    </div>
  );
}