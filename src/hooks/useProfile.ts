import { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { UserProfile } from '@/types';
import { useToast } from './use-toast';

export const useProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load profile when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadProfile();
    } else {
      setProfile(null);
    }
  }, [user, isAuthenticated]);

  const loadProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      let data = null;
      
      if (supabase) {
        const { data: supabaseData, error: supabaseError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (supabaseError && supabaseError.code !== 'PGRST116') {
          throw supabaseError;
        }
        
        data = supabaseData;
      } else {
        // localStorage fallback
        const stored = localStorage.getItem(`profile_${user.id}`);
        data = stored ? JSON.parse(stored) : null;
      }
      
      if (data) {
        setProfile({
          ...data,
          joinDate: data.created_at 
            ? `Membre depuis ${new Date(data.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}` 
            : 'Nouveau membre',
          stats: data.stats || { votes: 0, posts: 0, likes: 0, comments: 0 }
        } as UserProfile);
      } else {
        // Create profile if it doesn't exist
        await createProfile();
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      const errorMsg = handleSupabaseError(err);
      setError(errorMsg);
      toast({
        title: "Erreur de chargement",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    const newProfile: Partial<UserProfile> = {
      id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || '',
      email: user.email || '',
      username: user.email?.split('@')[0] || '',
      bio: '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      followers: 0,
      following: 0,
      is_admin: false,
      stats: { votes: 0, posts: 0, likes: 0, comments: 0 }
    };

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (error) {
          console.error('Error creating profile in Supabase:', error);
          throw error;
        }
        
        setProfile({
          ...data,
          joinDate: `Membre depuis ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
        } as UserProfile);
      } else {
        // localStorage fallback
        const profileWithDefaults = {
          ...newProfile,
          joinDate: `Membre depuis ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        localStorage.setItem(`profile_${user.id}`, JSON.stringify(profileWithDefaults));
        setProfile(profileWithDefaults as UserProfile);
      }
    } catch (err) {
      console.error('Error creating profile:', err);
      const errorMsg = handleSupabaseError(err);
      setError(errorMsg);
      toast({
        title: "Erreur de création",
        description: errorMsg,
        variant: "destructive"
      });
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    setLoading(true);
    setError(null);

    try {
      if (supabase) {
        // Check username uniqueness if being updated
        if (updates.username) {
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', updates.username)
            .neq('id', user.id)
            .single();
            
          if (existingUser) {
            throw new Error('Ce nom d\'utilisateur est déjà pris');
          }
        }
        
        const { data: updatedData, error } = await supabase
          .from('profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        
        setProfile(prev => prev ? { ...prev, ...updatedData } : null);
      } else {
        // localStorage fallback
        const current = localStorage.getItem(`profile_${user.id}`);
        if (current) {
          const updated = {
            ...JSON.parse(current),
            ...updates,
            updated_at: new Date().toISOString()
          };
          localStorage.setItem(`profile_${user.id}`, JSON.stringify(updated));
          setProfile(prev => prev ? { ...prev, ...updates } : null);
        }
      }
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées"
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMsg = handleSupabaseError(err);
      setError(errorMsg);
      toast({
        title: "Erreur de mise à jour",
        description: errorMsg,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addVote = async (playerId: string, playerName: string) => {
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      if (supabase) {
        const { error } = await supabase
          .from('user_votes')
          .insert([{
            user_id: user.id,
            player_id: playerId,
            player_name: playerName
          }]);
        
        if (error) throw error;
      } else {
        // localStorage fallback
        const votes = JSON.parse(localStorage.getItem('userVotes') || '[]');
        votes.push({
          id: crypto.randomUUID(),
          user_id: user.id,
          player_id: playerId,
          player_name: playerName,
          created_at: new Date().toISOString()
        });
        localStorage.setItem('userVotes', JSON.stringify(votes));
      }
      
      // Update profile stats
      if (profile) {
        const newStats = { ...profile.stats, votes: profile.stats.votes + 1 };
        await updateProfile({ stats: newStats });
      }
    } catch (err) {
      console.error('Error adding vote:', err);
      const errorMsg = handleSupabaseError(err);
      toast({
        title: "Erreur de vote",
        description: errorMsg,
        variant: "destructive"
      });
      throw err;
    }
  };

  const toggleFavorite = async (playerId: string, playerName: string) => {
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      if (supabase) {
        // Check if already favorited
        const { data: existing } = await supabase
          .from('user_favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('player_id', playerId)
          .single();

        if (existing) {
          // Remove favorite
          const { error } = await supabase
            .from('user_favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('player_id', playerId);
          
          if (error) throw error;
          return false;
        } else {
          // Add favorite
          const { error } = await supabase
            .from('user_favorites')
            .insert([{
              user_id: user.id,
              player_id: playerId,
              player_name: playerName
            }]);
          
          if (error) throw error;
          return true;
        }
      } else {
        // localStorage fallback
        const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
        const existingIndex = favorites.findIndex((fav: any) => 
          fav.user_id === user.id && fav.player_id === playerId
        );
        
        if (existingIndex >= 0) {
          favorites.splice(existingIndex, 1);
          localStorage.setItem('userFavorites', JSON.stringify(favorites));
          return false;
        } else {
          favorites.push({
            id: crypto.randomUUID(),
            user_id: user.id,
            player_id: playerId,
            player_name: playerName,
            created_at: new Date().toISOString()
          });
          localStorage.setItem('userFavorites', JSON.stringify(favorites));
          return true;
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      const errorMsg = handleSupabaseError(err);
      toast({
        title: "Erreur favoris",
        description: errorMsg,
        variant: "destructive"
      });
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    addVote,
    toggleFavorite,
    refreshProfile: loadProfile,
  };
};