import React from 'react';
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { useToast } from './use-toast';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });
  
  const { toast } = useToast();

  // Enhanced authentication initialization
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!supabase) {
        // Mock mode for development
        const mockUser = localStorage.getItem('mockUser');
        if (mounted) {
          setState({
            user: mockUser ? JSON.parse(mockUser) : null,
            loading: false,
            error: null
          });
        }
        return;
      }

      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn('Session error:', sessionError);
        }
        
        const user = session?.user || null;
        
        if (mounted) {
          setState({
            user,
            loading: false,
            error: sessionError?.message || null
          });
          
          // Create or update profile if user exists
          if (user) {
            await ensureProfile(user);
          }
        }
      } catch (error: any) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setState({
            user: null,
            loading: false,
            error: error.message
          });
        }
      }
    };

    initialize();

    // Listen for auth changes with enhanced handling
    const authSubscription = supabase?.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (mounted) {
          setState(prev => ({
            ...prev,
            user: session?.user ?? null,
            loading: false,
            error: null
          }));
          
          // Handle profile creation/update on sign in
          if (event === 'SIGNED_IN' && session?.user) {
            await ensureProfile(session.user);
          }
          
          // Update last seen on auth changes
          if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            updateLastSeen(session.user.id);
          }
        }
      }
    );

    return () => {
      mounted = false;
      authSubscription?.data?.subscription?.unsubscribe();
    };
  }, []);

  // Ensure user profile exists
  const ensureProfile = async (user: User) => {
    if (!supabase) return;
    
    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (!existingProfile && !fetchError) {
        // Create profile if it doesn't exist
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Utilisateur',
            email: user.email,
            username: user.email?.split('@')[0],
            bio: '',
            avatar: user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
            followers: 0,
            following: 0,
            is_admin: false,
            stats: { votes: 0, posts: 0, likes: 0, comments: 0 }
          }]);
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
        } else {
          console.log('✅ Profile created for user:', user.email);
        }
      }
    } catch (error) {
      console.error('Error ensuring profile:', error);
    }
  };
  
  // Update user last seen
  const updateLastSeen = async (userId: string) => {
    if (!supabase) return;
    
    try {
      await supabase
        .from('profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating last seen:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    if (!supabase) {
      // Mock mode for development
      const mockUser = {
        id: `mock-${Date.now()}`,
        email,
        user_metadata: { name: email.split('@')[0] }
      } as User;

      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      setState({ user: mockUser, loading: false, error: null });
      
      toast({
        title: "Connexion réussie (mode démo)",
        description: "Vous êtes connecté en mode hors ligne"
      });
      
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
        setState(prev => ({ ...prev, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }

      setState({
        user: data.user,
        loading: false,
        error: null
      });

      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans l'application !"
      });

      return { success: true };
    } catch (error: any) {
      console.error('Unexpected sign in error:', error);
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    if (!supabase) {
      // Mock mode for development
      const mockUser = {
        id: `mock-${Date.now()}`,
        email,
        user_metadata: { name: name || email.split('@')[0] }
      } as User;

      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      setState({ user: mockUser, loading: false, error: null });
      
      toast({
        title: "Inscription réussie (mode démo)",
        description: "Votre compte a été créé en mode hors ligne"
      });
      
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        setState(prev => ({ ...prev, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }

      setState({
        user: data.user,
        loading: false,
        error: null
      });

      toast({
        title: "Inscription réussie",
        description: data.user ? "Votre compte a été créé !" : "Vérifiez votre email pour confirmer votre compte"
      });

      return { success: true };
    } catch (error: any) {
      console.error('Unexpected sign up error:', error);
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true }));

    if (!supabase) {
      localStorage.removeItem('mockUser');
      setState({ user: null, loading: false, error: null });
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setState({ user: null, loading: false, error: null });
      
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !"
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      setState(prev => ({ ...prev, loading: false, error: error.message }));
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    clearError,
    isAuthenticated: !!state.user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}