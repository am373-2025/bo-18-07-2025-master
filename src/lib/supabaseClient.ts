import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if URLs are valid and not empty strings
const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidSupabaseConfig = isValidUrl(supabaseUrl) && supabaseKey && supabaseKey.trim() !== '';

if (!isValidSupabaseConfig) {
  console.warn('⚠️ Supabase configuration missing. Using localStorage fallback.');
  console.warn('To use Supabase, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = isValidSupabaseConfig 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Auth helpers with proper error handling
export const getCurrentUser = async () => {
  if (!supabase) return null;
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const signIn = async (email: string, password: string) => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { data: null, error };
  }
};

export const signUp = async (email: string, password: string, metadata?: any) => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  if (!supabase) return { error: null };
  
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { error };
  }
};

// Enhanced storage with validation
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      const parsed = JSON.parse(item);
      return parsed !== null ? parsed : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    try {
      if (value === undefined) {
        localStorage.removeItem(key);
        return true;
      }
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  },

  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  },

  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// Database helper functions
export const db = {
  // Get user profile
  getProfile: async (userId: string) => {
    if (!supabase) return storage.get(`profile_${userId}`, null);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return storage.get(`profile_${userId}`, null);
    }
  },

  // Update user profile
  updateProfile: async (userId: string, updates: any) => {
    if (!supabase) {
      const current = storage.get(`profile_${userId}`, {});
      const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
      storage.set(`profile_${userId}`, updated);
      return updated;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Vote for player
  voteForPlayer: async (userId: string, playerId: string, playerName: string) => {
    if (!supabase) {
      const votes = storage.get('userVotes', []);
      const vote = { user_id: userId, player_id: playerId, player_name: playerName, created_at: new Date().toISOString() };
      votes.push(vote);
      storage.set('userVotes', votes);
      return vote;
    }
    
    try {
      const { data, error } = await supabase
        .from('user_votes')
        .insert([{ user_id: userId, player_id: playerId, player_name: playerName }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error voting for player:', error);
      throw error;
    }
  },

  // Toggle favorite
  toggleFavorite: async (userId: string, playerId: string, playerName: string) => {
    if (!supabase) {
      const favorites = storage.get('userFavorites', []);
      const existingIndex = favorites.findIndex((fav: any) => fav.player_id === playerId && fav.user_id === userId);
      
      if (existingIndex >= 0) {
        favorites.splice(existingIndex, 1);
      } else {
        favorites.push({ user_id: userId, player_id: playerId, player_name: playerName, created_at: new Date().toISOString() });
      }
      
      storage.set('userFavorites', favorites);
      return { isFavorited: existingIndex < 0 };
    }
    
    try {
      // Check if already favorited
      const { data: existing } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('player_id', playerId)
        .single();

      if (existing) {
        // Remove favorite
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('player_id', playerId);
        
        if (error) throw error;
        return { isFavorited: false };
      } else {
        // Add favorite
        const { error } = await supabase
          .from('user_favorites')
          .insert([{ user_id: userId, player_id: playerId, player_name: playerName }]);
        
        if (error) throw error;
        return { isFavorited: true };
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }
};