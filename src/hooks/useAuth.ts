import { useState, useEffect } from 'react';
import { supabase, signIn, signUp, signOut, getCurrentUser } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial user
    getCurrentUser().then(user => {
      setState(prev => ({ ...prev, user, loading: false }));
    });

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setState(prev => ({ 
            ...prev, 
            user: session?.user ?? null,
            loading: false,
            error: null
          }));
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    if (!supabase) {
      // Mock login for localStorage mode
      const mockUser = {
        id: 'mock-user-' + Date.now(),
        email,
        user_metadata: { name: email.split('@')[0] }
      } as User;
      
      setState(prev => ({ ...prev, user: mockUser, loading: false }));
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      return { data: { user: mockUser }, error: null };
    }

    try {
      const { data, error } = await signIn(email, password);
      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
      }
      return { data, error };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { data: null, error: { message: errorMessage } };
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    if (!supabase) {
      // Mock registration for localStorage mode
      const mockUser = {
        id: 'mock-user-' + Date.now(),
        email,
        user_metadata: { name: name || email.split('@')[0] }
      } as User;
      
      setState(prev => ({ ...prev, user: mockUser, loading: false }));
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      return { data: { user: mockUser }, error: null };
    }

    try {
      const { data, error } = await signUp(email, password, { name });
      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
      }
      return { data, error };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { data: null, error: { message: errorMessage } };
    }
  };

  const logout = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    if (!supabase) {
      // Mock logout for localStorage mode
      localStorage.removeItem('mockUser');
      setState({ user: null, loading: false, error: null });
      return { error: null };
    }

    try {
      const { error } = await signOut();
      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
      } else {
        setState({ user: null, loading: false, error: null });
      }
      return { error };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { error: { message: errorMessage } };
    }
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    isAuthenticated: !!state.user,
  };
};