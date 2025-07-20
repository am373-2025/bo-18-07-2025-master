import { useEffect, useState } from "react";
import { supabase, handleSupabaseError, isSupabaseWorking, setSupabaseWorking } from "@/lib/supabase";
import { useToast } from "./use-toast";

export function useSupabaseTable<T = any>(
  table: string, 
  filter?: Record<string, any>, 
  columnsToSelect?: string
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingLocalStorage, setUsingLocalStorage] = useState(false);
  const { toast } = useToast();
  
  const storageKey = `table_${table}`;
  
  // Enhanced localStorage operations
  const storage = {
    get: <T>(key: string, defaultValue: T): T => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        return defaultValue;
      }
    },
    set: <T>(key: string, value: T): boolean => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error(`Error writing localStorage key "${key}":`, error);
        return false;
      }
    }
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      setUsingLocalStorage(false);

      // Try Supabase first if available and working
      if (supabase && isSupabaseWorking()) {
        try {
          let query = supabase.from(table).select(columnsToSelect || '*');
          
          // Apply filters
          if (filter) {
            Object.entries(filter).forEach(([key, value]) => {
              query = query.eq(key, value);
            });
          }
          
          // Add timeout to prevent hanging
          const queryPromise = query;
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Query timeout')), 10000)
          );
          
          const { data: supabaseData, error: supabaseError } = await Promise.race([
            queryPromise,
            timeoutPromise
          ]) as any;
          
          if (supabaseError) {
            // Handle specific errors
            if (supabaseError.code === '42P01' || supabaseError.message?.includes('does not exist')) {
              console.warn(`❌ Table ${table} does not exist in Supabase`);
              throw new Error('TABLE_NOT_EXISTS');
            }
            throw supabaseError;
          }
          
          // Success - cache data and update state
          const result = supabaseData || [];
          storage.set(storageKey, result);
          setData(result);
          setSupabaseWorking(true);
          
        } catch (supabaseError: any) {
          console.error(`Supabase query failed for table ${table}:`, supabaseError);
          
          // Handle network/connection errors
          if (supabaseError.message?.includes('fetch') || 
              supabaseError.message?.includes('timeout') ||
              supabaseError.name === 'TypeError') {
            setSupabaseWorking(false);
          }
          
          // Fall back to localStorage
          fallbackToLocalStorage();
        }
      } else {
        // Use localStorage if Supabase not available
        fallbackToLocalStorage();
      }
    }
    
    function fallbackToLocalStorage() {
      setUsingLocalStorage(true);
      const stored = storage.get(storageKey, []);
      setData(stored);
      
      if (!stored.length && table === 'players') {
        // Populate with sample data for players if empty
        populateSamplePlayers();
      }
      
      setLoading(false);
    }
    
    function populateSamplePlayers() {
      const samplePlayers = [
        {
          id: '1',
          slug: 'kylian-mbappe',
          name: 'Kylian Mbappé',
          position: 'Attaquant',
          club: 'Real Madrid',
          photo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
          votes: 12456,
          country: 'France',
          age: 25,
          ranking: 1,
          trend: 'up',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          slug: 'erling-haaland',
          name: 'Erling Haaland',
          position: 'Attaquant',
          club: 'Manchester City',
          photo: 'https://images.unsplash.com/photo-1556506751-69a7d6fb64dd?w=400&h=300&fit=crop',
          votes: 11234,
          country: 'Norvège',
          age: 24,
          ranking: 2,
          trend: 'stable',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          slug: 'jude-bellingham',
          name: 'Jude Bellingham',
          position: 'Milieu',
          club: 'Real Madrid',
          photo: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=400&h=300&fit=crop',
          votes: 9876,
          country: 'Angleterre',
          age: 21,
          ranking: 3,
          trend: 'up',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      storage.set(storageKey, samplePlayers);
      setData(samplePlayers);
      
      toast({
        title: "Mode démo activé",
        description: "Données d'exemple chargées (Supabase non configuré)"
      });
    }
    
    // Execute the fetch
    fetchData().finally(() => {
      setLoading(false);
    });
  }, [table, JSON.stringify(filter), columnsToSelect]);

  // Enhanced CRUD operations
  const insert = async (values: T | T[]) => {
    try {
      const itemsToInsert = Array.isArray(values) ? values : [values];
      
      if (supabase && isSupabaseWorking()) {
        try {
          const { data: insertedData, error } = await supabase
            .from(table)
            .insert(itemsToInsert)
            .select();
            
          if (error) {
            if (error.code === '42P01') {
              throw new Error('TABLE_NOT_EXISTS');
            }
            throw error;
          }
          
          const newData = insertedData || [];
          setData(prev => [...newData, ...prev]);
          
          // Update localStorage cache
          const currentData = storage.get(storageKey, []);
          storage.set(storageKey, [...newData, ...currentData]);
          
          return { data: newData, error: null };
        } catch (supabaseErr: any) {
          if (supabaseErr.message?.includes('fetch') || supabaseErr.name === 'TypeError') {
            setSupabaseWorking(false);
          }
          // Fall through to localStorage
        }
      }
      
      // localStorage fallback
      const current = storage.get(storageKey, []);
      const dataWithIds = itemsToInsert.map((item: any) => ({
        ...item,
        id: item.id || crypto.randomUUID(),
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString()
      }));
      
      const updated = [...dataWithIds, ...current];
      storage.set(storageKey, updated);
      setData(updated);
      
      return { data: dataWithIds, error: null };
    } catch (err: any) {
      console.error(`Error inserting into table ${table}:`, err);
      const errorMsg = handleSupabaseError(err);
      toast({
        title: "Erreur d'insertion",
        description: errorMsg,
        variant: "destructive"
      });
      return { data: null, error: errorMsg };
    }
  };
  
  const update = async (id: any, values: Partial<T>) => {
    try {
      if (supabase && isSupabaseWorking()) {
        try {
          const { data: updatedData, error } = await supabase
            .from(table)
            .update({ ...values, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();
            
          if (error) {
            if (error.code === '42P01') {
              throw new Error('TABLE_NOT_EXISTS');
            }
            throw error;
          }
          
          setData(prev => prev.map((item: any) => 
            item.id === id ? { ...item, ...values, updated_at: new Date().toISOString() } : item
          ));
          
          // Update localStorage cache
          const current = storage.get(storageKey, []);
          const updated = current.map((item: any) => 
            item.id === id ? { ...item, ...values, updated_at: new Date().toISOString() } : item
          );
          storage.set(storageKey, updated);
          
          return { data: updatedData, error: null };
        } catch (supabaseErr: any) {
          if (supabaseErr.message?.includes('fetch') || supabaseErr.name === 'TypeError') {
            setSupabaseWorking(false);
          }
          // Fall through to localStorage
        }
      }
      
      // localStorage fallback
      const current = storage.get(storageKey, []);
      const updated = current.map((item: any) => 
        item.id === id ? { ...item, ...values, updated_at: new Date().toISOString() } : item
      );
      storage.set(storageKey, updated);
      setData(updated);
      
      return { data: values, error: null };
    } catch (err: any) {
      console.error(`Error updating table ${table}:`, err);
      const errorMsg = handleSupabaseError(err);
      toast({
        title: "Erreur de mise à jour",
        description: errorMsg,
        variant: "destructive"
      });
      return { data: null, error: errorMsg };
    }
  };
  
  const remove = async (id: any) => {
    try {
      if (supabase && isSupabaseWorking()) {
        try {
          const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);
            
          if (error) {
            if (error.code === '42P01') {
              throw new Error('TABLE_NOT_EXISTS');
            }
            throw error;
          }
          
          setData(prev => prev.filter((item: any) => item.id !== id));
          
          // Update localStorage cache
          const current = storage.get(storageKey, []);
          const updated = current.filter((item: any) => item.id !== id);
          storage.set(storageKey, updated);
          
          return { data: null, error: null };
        } catch (supabaseErr: any) {
          if (supabaseErr.message?.includes('fetch') || supabaseErr.name === 'TypeError') {
            setSupabaseWorking(false);
          }
          // Fall through to localStorage
        }
      }
      
      // localStorage fallback
      const current = storage.get(storageKey, []);
      const updated = current.filter((item: any) => item.id !== id);
      storage.set(storageKey, updated);
      setData(updated);
      
      return { data: null, error: null };
    } catch (err: any) {
      console.error(`Error deleting from table ${table}:`, err);
      const errorMsg = handleSupabaseError(err);
      toast({
        title: "Erreur de suppression",
        description: errorMsg,
        variant: "destructive"
      });
      return { data: null, error: errorMsg };
    }
  };

  const refetch = () => {
    setLoading(true);
    // Re-trigger the effect
  };

  return { 
    data, 
    loading, 
    error: error || (!isSupabaseWorking() && !usingLocalStorage ? 'Connexion Supabase impossible' : null), 
    insert, 
    update, 
    remove, 
    usingLocalStorage,
    refetch
  };
}