import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced configuration validation with better fallbacks
const isValidConfig = () => {
  // For development, allow mock data if no Supabase config
  if (import.meta.env.DEV && (!supabaseUrl || !supabaseKey)) {
    console.warn('⚠️ Supabase not configured - using localStorage mode');
    return false;
  }
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration in production');
    return false;
  }
  
  try {
    new URL(supabaseUrl);
    if (supabaseKey.length < 20) {
      throw new Error('Invalid key length');
    }
    return true;
  } catch (error) {
    console.error('❌ Invalid Supabase configuration:', error);
    return false;
  }
};

export const supabase = isValidConfig()
  ? createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      },
      global: {
        headers: {
          'x-application-name': 'ballon-dor-2025'
        }
      }
    })
  : null;

// Track if Supabase is working
let supabaseWorking = isValidConfig();

export const isSupabaseWorking = () => supabaseWorking;
export const setSupabaseWorking = (working: boolean) => {
  supabaseWorking = working;
  if (!working) {
    console.warn('⚠️ Supabase connection lost - using offline mode');
  } else {
    console.log('✅ Supabase connection restored');
  }
};

// Enhanced error handling with specific error types
export const handleSupabaseError = (error: any): string => {
  if (!error) return 'Erreur inconnue';
  
  // Handle network errors
  if (error.message?.includes('Failed to fetch') || error.name === 'TypeError' || error.code === 'NETWORK_ERROR') {
    setSupabaseWorking(false);
    return 'Mode hors ligne activé';
  }
  
  // Handle authentication errors
  if (error.message?.includes('Invalid login') || error.status === 401) {
    return 'Identifiants incorrects';
  }
  
  // Handle permission errors
  if (error.code === '42501' || error.status === 403) {
    return 'Permissions insuffisantes';
  }
  
  // Handle validation errors
  if (error.code === '23505') {
    return 'Cette donnée existe déjà';
  }
  
  const errorMessages: Record<string, string> = {
    'PGRST301': 'Ressource non trouvée',
    'PGRST204': 'Aucun résultat trouvé',
    'PGRST116': 'Une seule ligne attendue',
    '23503': 'Référence invalide',
    'PGRST102': 'Table non trouvée',
    'PGRST103': 'Colonne non trouvée'
  };
  
  return errorMessages[error.code] || error.message || 'Erreur de base de données';
};

// Connection test function
export const testSupabaseConnection = async (): Promise<boolean> => {
  if (!supabase) return false;
  
  try {
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) throw error;
    setSupabaseWorking(true);
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    setSupabaseWorking(false);
    return false;
  }
};

// Types pour les hooks
export type SupabaseTable = keyof Database['public']['Tables'];
export type SupabaseRow<T extends SupabaseTable> = Database['public']['Tables'][T]['Row'];
export type SupabaseInsert<T extends SupabaseTable> = Database['public']['Tables'][T]['Insert'];
export type SupabaseUpdate<T extends SupabaseTable> = Database['public']['Tables'][T]['Update'];

// Test connection on initialization
if (supabase) {
  testSupabaseConnection().then(connected => {
    console.log(connected ? '✅ Supabase connecté' : '⚠️ Connexion Supabase échouée');
  });
} else {
  console.log('⚠️ Mode localStorage - variables d\'environnement Supabase manquantes');
}