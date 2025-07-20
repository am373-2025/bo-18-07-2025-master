import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérification de la configuration
const isValidConfig = supabaseUrl && supabaseKey && 
  supabaseUrl.startsWith('https://') && 
  supabaseKey.length > 20;

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

// Vérification de la santé de Supabase
export const checkSupabaseHealth = async (): Promise<boolean> => {
  if (!supabase) return false;
  
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
};

// Gestion des erreurs Supabase
export const handleSupabaseError = (error: any): string => {
  if (!error) return 'Erreur inconnue';
  
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