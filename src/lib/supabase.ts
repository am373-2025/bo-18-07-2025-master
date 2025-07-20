import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced configuration validation
const isValidConfig = (() => {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase environment variables not set');
    return false;
  }
  
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('supabase.co')) {
    console.warn('⚠️ Invalid Supabase URL format');
    return false;
  }
  
  if (supabaseKey.length < 20) {
    console.warn('⚠️ Invalid Supabase key format');
    return false;
  }
  
  return true;
})();

export const supabase = isValidConfig 
  ? createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

// Track if Supabase is working
let supabaseWorking = isValidConfig;

export const isSupabaseWorking = () => supabaseWorking;
export const setSupabaseWorking = (working: boolean) => {
  supabaseWorking = working;
};

// Gestion des erreurs Supabase
export const handleSupabaseError = (error: any): string => {
  if (!error) return 'Erreur inconnue';
  
  // Handle network errors
  if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
    setSupabaseWorking(false);
    return 'Mode hors ligne activé';
  }
  
  const errorMessages: Record<string, string> = {
    'PGRST301': 'Ressource non trouvée',
    'PGRST204': 'Aucun résultat trouvé',
    'PGRST116': 'Une seule ligne attendue',
    '23505': 'Cette donnée existe déjà',
    '23503': 'Référence invalide',
    '42501': 'Permissions insuffisantes'
  };
  
  return errorMessages[error.code] || error.message || 'Erreur de base de données';
};

// Types pour les hooks
export type SupabaseTable = keyof Database['public']['Tables'];
export type SupabaseRow<T extends SupabaseTable> = Database['public']['Tables'][T]['Row'];
export type SupabaseInsert<T extends SupabaseTable> = Database['public']['Tables'][T]['Insert'];
export type SupabaseUpdate<T extends SupabaseTable> = Database['public']['Tables'][T]['Update'];

console.log(isValidConfig ? '✅ Supabase configuré' : '⚠️ Utilisation du mode localStorage');