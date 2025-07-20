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

  // Initialisation de l'authentification
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!supabase) {
        // Mode localStorage
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
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (mounted) {
          setState({
            user: error ? null : user,
            loading: false,
            error: error?.message || null
          });
        }
      } catch (error: any) {
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

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase?.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (mounted) {
          setState(prev => ({
            ...prev,
            user: session?.user ?? null,
            loading: false,
            error: null
          }));
        }
      }
    ) || { data: { subscription: { unsubscribe: () => {} } } };

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    if (!supabase) {
      // Mode localStorage
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
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    if (!supabase) {
      // Mode localStorage
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
        description: "Votre compte a été créé avec succès !"
      });

      return { success: true };
    } catch (error: any) {
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
      await supabase.auth.signOut();
      setState({ user: null, loading: false, error: null });
      
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !"
      });
    } catch (error: any) {
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