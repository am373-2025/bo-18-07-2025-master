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
import { supabase } from "@/lib/supabaseClient";
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
  Crown,
  MessageCircle,
  UserPlus,
  UserMinus,
  Camera,
  MoreVertical,
  Share2,
  Grid3X3,
  Bookmark,
  Phone,
  MapPin,
  Link,
  Calendar,
  Verified
} from "lucide-react";
import { ChangePasswordModal } from "@/components/ui/change-password-modal";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { PlayerCard } from "@/components/ui/player-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

interface UserMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

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
  const [showMessageModal, setShowMessageModal] = useState(false);
  const { flags, isAdmin, setIsAdmin } = useFeatureFlags();
  const [adminProfile, setAdminProfile] = useState(getAdminProfile());
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    username: ""
  });
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: playersData } = useSupabaseTable('players');
  const [favoritePlayers, setFavoritePlayers] = useState<any[]>([]);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("posts");

  // Initialize edit form when profile loads
  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        bio: profile.bio || '',
        username: profile.username || ''
      });
      setFollowersCount(profile.followers || 0);
      setFollowingCount(profile.following || 0);
    }
  }, [profile]);

  // Load user posts
  useEffect(() => {
    const loadUserPosts = async () => {
      if (!user) return;
      
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('user_posts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);
          
          if (!error && data) {
            setUserPosts(data);
          }
        } else {
          const stored = JSON.parse(localStorage.getItem('userPosts') || '[]');
          setUserPosts(stored.filter((p: any) => p.user_id === user.id).slice(0, 10));
        }
      } catch (error) {
        console.error('Error loading posts:', error);
      }
    };

    loadUserPosts();
  }, [user]);

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

  // Check if current user is following this profile
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user || !profile || user.id === profile.id) return;
      
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('user_follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('following_id', profile.id)
            .single();
          
          setIsFollowing(!!data && !error);
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowStatus();
  }, [user, profile]);

  const handleSaveProfile = async () => {
    if (profile) {
      try {
        await updateProfile({
          name: editForm.name,
          bio: editForm.bio,
          username: editForm.username
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

  const handleFollow = async () => {
    if (!user || !profile || user.id === profile.id) return;
    
    try {
      if (supabase) {
        if (isFollowing) {
          // Unfollow
          await supabase
            .from('user_follows')
            .delete()
            .eq('follower_id', user.id)
            .eq('following_id', profile.id);
          
          setIsFollowing(false);
          setFollowersCount(prev => Math.max(0, prev - 1));
          
          toast({
            title: "Unfollowed",
            description: `Vous ne suivez plus ${profile.name}`
          });
        } else {
          // Follow
          await supabase
            .from('user_follows')
            .insert([{
              follower_id: user.id,
              following_id: profile.id
            }]);
          
          setIsFollowing(true);
          setFollowersCount(prev => prev + 1);
          
          toast({
            title: "Suivi !",
            description: `Vous suivez maintenant ${profile.name}`
          });
        }
      } else {
        // localStorage fallback
        const follows = JSON.parse(localStorage.getItem('userFollows') || '[]');
        if (isFollowing) {
          const updated = follows.filter((f: any) => 
            !(f.follower_id === user.id && f.following_id === profile.id)
          );
          localStorage.setItem('userFollows', JSON.stringify(updated));
          setIsFollowing(false);
          setFollowersCount(prev => Math.max(0, prev - 1));
        } else {
          follows.push({
            id: crypto.randomUUID(),
            follower_id: user.id,
            following_id: profile.id,
            created_at: new Date().toISOString()
          });
          localStorage.setItem('userFollows', JSON.stringify(follows));
          setIsFollowing(true);
          setFollowersCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error handling follow:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le suivi",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!user || !profile || !messageContent.trim() || user.id === profile.id) return;
    
    setSendingMessage(true);
    try {
      if (supabase) {
        await supabase
          .from('user_messages')
          .insert([{
            sender_id: user.id,
            receiver_id: profile.id,
            content: messageContent.trim()
          }]);
      } else {
        const messages = JSON.parse(localStorage.getItem('userMessages') || '[]');
        messages.push({
          id: crypto.randomUUID(),
          sender_id: user.id,
          receiver_id: profile.id,
          content: messageContent.trim(),
          is_read: false,
          created_at: new Date().toISOString()
        });
        localStorage.setItem('userMessages', JSON.stringify(messages));
      }
      
      setMessageContent("");
      setShowMessageModal(false);
      
      toast({
        title: "Message envoyé !",
        description: `Votre message a été envoyé à ${profile.name}`
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
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
  };

  const handlePasswordChange = () => {
    setShowChangePasswordModal(true);
  };

  const handlePasswordChangeSubmit = async (current: string, next: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    if (current !== "password123") {
      throw new Error("Mot de passe actuel incorrect.");
    }
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

  const handleContactSupport = () => {
    const subject = encodeURIComponent("Demande d'aide - Ballon d'Or 2025");
    const body = encodeURIComponent("Bonjour,\n\nJ'ai besoin d'aide concernant :\n\n[Décrivez votre demande]\n\nCordialement");
    window.open(`mailto:support@ballondor2025.com?subject=${subject}&body=${body}`);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
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
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
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

  const isOwnProfile = user.id === profile?.id;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header moderne avec design iOS */}
      <header className="bg-background/95 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Profil</h1>
            </div>
            <div className="flex items-center gap-2">
              {isOwnProfile && (
                <>
                  <Button size="sm" variant="ghost" onClick={handleToggleDarkMode}>
                    {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowSettingsModal(true)}>
                    <Settings className="w-5 h-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {/* Hero Section avec Cover + Avatar */}
        <div className="relative">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute inset-0 bg-noise opacity-5" />
          </div>

          {/* Avatar + Quick Actions */}
          <div className="px-6 relative">
            <div className="flex items-end justify-between -mt-16 mb-4">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-background shadow-2xl ring-4 ring-primary/10">
                  <AvatarImage src={profile?.avatar} alt={profile?.name} />
                  <AvatarFallback className="text-2xl font-bold">{profile?.name?.slice(0, 2) || 'U'}</AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary shadow-lg"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-5 h-5" />
                  </Button>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleAvatarFileChange}
                />
              </div>

              {!isOwnProfile && (
                <div className="flex gap-2 mb-8">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setShowMessageModal(true)}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm" 
                    className={isFollowing ? "bg-muted text-muted-foreground" : "btn-golden"}
                    onClick={handleFollow}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4 mr-2" />
                        Suivi
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Suivre
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{profile?.name}</h2>
                {profile?.isAdmin && (
                  <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                    <Verified className="w-3 h-3 mr-1" />
                    Vérifié
                  </Badge>
                )}
              </div>
              
              {profile?.username && (
                <p className="text-muted-foreground">@{profile.username}</p>
              )}
              
              {profile?.bio && (
                <p className="text-sm leading-relaxed">{profile.bio}</p>
              )}

              {/* Stats Row */}
              <div className="flex items-center gap-6 pt-2">
                <div className="text-center">
                  <div className="text-xl font-bold">{followersCount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{followingCount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Suivi</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{profile?.stats?.votes || 0}</div>
                  <div className="text-xs text-muted-foreground">Votes</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{profile?.stats?.posts || userPosts.length}</div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </div>
              </div>

              {/* Action Buttons for own profile */}
              {isOwnProfile && (
                <div className="flex gap-3 pt-4">
                  <Dialog open={editingProfile} onOpenChange={setEditingProfile}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm mx-auto">
                      <DialogHeader>
                        <DialogTitle>Modifier le profil</DialogTitle>
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
                          <label className="text-sm font-medium">Nom d'utilisateur</label>
                          <Input
                            value={editForm.username}
                            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                            className="mt-1"
                            placeholder="@username"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Bio</label>
                          <Textarea
                            value={editForm.bio}
                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                            className="mt-1"
                            rows={3}
                            placeholder="Parlez-nous de vous..."
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
                  
                  <Button variant="outline" onClick={() => setShowAvatarModal(true)}>
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 mb-6">
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4" />
                Posts
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                Favoris
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Stats
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-4">
              {userPosts.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {userPosts.map((post) => (
                    <Card key={post.id} className="aspect-square relative overflow-hidden group cursor-pointer">
                      <CardContent className="p-0 h-full">
                        {post.image_url ? (
                          <img 
                            src={post.image_url} 
                            alt="Post" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted/50 flex items-center justify-center p-3">
                            <p className="text-xs text-center line-clamp-4">{post.content}</p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-white text-center">
                            <Heart className="w-5 h-5 mx-auto mb-1" />
                            <span className="text-xs">{post.likes || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Grid3X3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Aucune publication</p>
                  {isOwnProfile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Commencez à partager vos moments !
                    </p>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              {favoritePlayers.length > 0 ? (
                <div className="grid gap-4">
                  {favoritePlayers.slice(0, 6).map((player) => (
                    <div key={player.id} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/50">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={player.photo} alt={player.name} />
                        <AvatarFallback>{player.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{player.name}</h4>
                        <p className="text-sm text-muted-foreground">{player.club}</p>
                      </div>
                      <Heart className="w-5 h-5 text-red-500 fill-current" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Aucun favori</p>
                  {isOwnProfile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Likez des joueurs pour les retrouver ici
                    </p>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 text-center">
                  <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{profile?.stats?.votes || 0}</div>
                  <div className="text-xs text-muted-foreground">Total Votes</div>
                </Card>
                <Card className="p-4 text-center">
                  <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{profile?.stats?.likes || 0}</div>
                  <div className="text-xs text-muted-foreground">Likes Reçus</div>
                </Card>
                <Card className="p-4 text-center">
                  <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{profile?.stats?.comments || 0}</div>
                  <div className="text-xs text-muted-foreground">Commentaires</div>
                </Card>
                <Card className="p-4 text-center">
                  <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{followersCount}</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </Card>
              </div>

              {profile?.joinDate && (
                <Card className="p-4 text-center">
                  <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground">{profile.joinDate}</div>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Admin Section - Only for admins */}
        {isOwnProfile && isAdmin && (
          <div className="px-6 mt-6">
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-primary" />
                    <span className="font-medium">Panel Admin</span>
                  </div>
                  <Switch checked={isAdmin} onCheckedChange={handleToggleAdmin} />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setShowFeatureFlagsModal(true)}
                    className="btn-golden flex-1"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Feature Flags
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleContactSupport}
                    className="flex-1"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings for own profile */}
        {isOwnProfile && (
          <div className="px-6 mt-6 space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Notifications</span>
                  </div>
                  <Switch checked={notifications} onCheckedChange={handleToggleNotifications} />
                </div>
                
                <Button variant="outline" className="w-full justify-start" onClick={handlePasswordChange}>
                  <Lock className="w-5 h-5 mr-3" />
                  Changer le mot de passe
                </Button>
                
                <Button variant="outline" className="w-full justify-start text-destructive" onClick={handleLogout}>
                  <LogOut className="w-5 h-5 mr-3" />
                  Se déconnecter
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Envoyer un message
            </DialogTitle>
            <DialogDescription>
              Envoyez un message privé à {profile?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Tapez votre message..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowMessageModal(false)}
              >
                Annuler
              </Button>
              <Button 
                className="flex-1 btn-golden"
                onClick={handleSendMessage}
                disabled={!messageContent.trim() || sendingMessage}
              >
                {sendingMessage ? "Envoi..." : "Envoyer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modals */}
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
      
      {isAdmin && (
        <FeatureFlagsModal
          open={showFeatureFlagsModal}
          onOpenChange={(open) => setShowFeatureFlagsModal(!!open)}
        />
      )}
    </div>
  );
}