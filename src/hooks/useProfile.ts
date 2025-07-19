import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
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
      if (supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Profile doesn't exist, create one
            await createProfile();
          } else {
            throw error;
          }
        } else {
          setProfile(data as UserProfile);
        }
      } else {
        // localStorage fallback
        const stored = localStorage.getItem(`profile_${user.id}`);
        if (stored) {
          setProfile(JSON.parse(stored));
        } else {
          await createProfile();
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    const newProfile: UserProfile = {
      id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || '',
      username: user.email?.split('@')[0] || '',
      bio: '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      followers: 0,
      following: 0,
      joinDate: `Membre depuis ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
      favorites: [],
      stats: {
        votes: 0,
        posts: 0,
        likes: 0,
        comments: 0
      }
    };

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (error) throw error;
        setProfile(data as UserProfile);
      } else {
        localStorage.setItem(`profile_${user.id}`, JSON.stringify(newProfile));
        setProfile(newProfile);
      }
    } catch (err) {
      console.error('Error creating profile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    setLoading(true);
    setError(null);

    try {
      const updatedProfile = { ...profile, ...updates };

      if (supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

        if (error) throw error;
        setProfile(data as UserProfile);
      } else {
        localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));
        setProfile(updatedProfile);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addVote = async (playerId: string, playerName: string) => {
    if (!user) return;

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
        const votes = JSON.parse(localStorage.getItem('userVotes') || '[]');
        votes.push({ user_id: user.id, player_id: playerId, player_name: playerName, created_at: new Date().toISOString() });
        localStorage.setItem('userVotes', JSON.stringify(votes));
      }

      // Update profile stats
      if (profile) {
        await updateProfile({ 
          stats: { ...profile.stats, votes: profile.stats.votes + 1 } 
        });
      }
    } catch (err) {
      console.error('Error adding vote:', err);
      throw err;
    }
  };

  const toggleFavorite = async (playerId: string, playerName: string) => {
    if (!user) return;

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
        }
      } else {
        const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
        const existingIndex = favorites.findIndex((fav: any) => fav.player_id === playerId && fav.user_id === user.id);
        
        if (existingIndex >= 0) {
          favorites.splice(existingIndex, 1);
        } else {
          favorites.push({ user_id: user.id, player_id: playerId, player_name: playerName, created_at: new Date().toISOString() });
        }
        localStorage.setItem('userFavorites', JSON.stringify(favorites));
      }
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