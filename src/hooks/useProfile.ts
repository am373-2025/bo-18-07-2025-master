import { useState, useEffect } from 'react';
import { supabase, db } from '@/lib/supabaseClient';
import { useAuth } from './useAuth';
import type { UserProfile } from '@/types';

export const useProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const data = await db.getProfile(user.id);
      
      if (data) {
        setProfile({
          ...data,
          joinDate: data.created_at ? `Membre depuis ${new Date(data.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}` : 'Nouveau membre',
          favorites: data.favorites || [],
          stats: data.stats || { votes: 0, posts: 0, likes: 0, comments: 0 }
        });
      } else {
        // Create profile if doesn't exist
        await createProfile();
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement du profil');
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
      stats: { votes: 0, posts: 0, likes: 0, comments: 0 }
    };

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (error) throw error;
        setProfile({
          ...data,
          joinDate: `Membre depuis ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
          favorites: []
        });
      } else {
        // localStorage fallback
        const profileWithDefaults = {
          ...newProfile,
          joinDate: `Membre depuis ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
          favorites: []
        };
        localStorage.setItem(`profile_${user.id}`, JSON.stringify(profileWithDefaults));
        setProfile(profileWithDefaults as UserProfile);
      }
    } catch (err) {
      console.error('Error creating profile:', err);
      setError(err instanceof Error ? err.message : 'Erreur de création du profil');
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    setLoading(true);
    setError(null);

    try {
      // Ensure username is unique if being updated
      if (updates.username && supabase) {
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
      
      const updatedData = await db.updateProfile(user.id, updates);
      setProfile(prev => prev ? { ...prev, ...updatedData } : null);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Erreur de mise à jour du profil');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addVote = async (playerId: string, playerName: string) => {
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      await db.voteForPlayer(user.id, playerId, playerName);
      
      // Update profile stats
      if (profile) {
        const newStats = { ...profile.stats, votes: profile.stats.votes + 1 };
        await updateProfile({ stats: newStats });
      }
    } catch (err) {
      console.error('Error adding vote:', err);
      throw err;
    }
  };

  const toggleFavorite = async (playerId: string, playerName: string) => {
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      const result = await db.toggleFavorite(user.id, playerId, playerName);
      return result.isFavorited;
    } catch (err) {
      console.error('Error toggling favorite:', err);
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