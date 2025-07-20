import { useEffect, useState } from "react";
import { supabase, storage } from "@/lib/supabaseClient";
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { favoritePlayersNames } from '@/utils/ballonDorPlayers';

export function useSupabaseTable<T = any>(
  table: string, 
  filter?: Record<string, any>, 
  columnsToSelect?: string
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingLocalStorage, setUsingLocalStorage] = useState(false);

  // Fonction pour créer des données de démonstration
  const createDemoData = (tableName: string) => {
    if (tableName === 'players') {
      return favoritePlayersNames.slice(0, 30).map((name, index) => ({
        id: `demo-${index + 1}`,
        slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        name,
        position: ['Attaquant', 'Milieu', 'Défenseur', 'Gardien'][index % 4],
        club: ['Real Madrid', 'PSG', 'Barcelona', 'Manchester City', 'Bayern Munich'][index % 5],
        photo: `https://images.unsplash.com/photo-${1571019613454 + (index * 1000)}?w=400&h=300&fit=crop&face`,
        votes: Math.floor(Math.random() * 10000) + 1000,
        country: ['France', 'Espagne', 'Angleterre', 'Allemagne', 'Brésil'][index % 5],
        age: 20 + (index % 15),
        ranking: index + 1,
        trend: ['up', 'down', 'stable'][index % 3] as 'up' | 'down' | 'stable',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
    }
    return [];
  };
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      setUsingLocalStorage(false);

      console.log(`🔄 Chargement table: ${table}`);

      try {
        if (supabase) {
          try {
            // Try Supabase first
            console.log(`📡 Tentative connexion Supabase pour: ${table}`);
            let query = supabase.from(table).select(columnsToSelect || '*');
            
            if (filter) {
              Object.entries(filter).forEach(([key, value]) => {
                query = query.eq(key, value);
              });
            }
            
            const { data: supabaseData, error: supabaseError } = await query;
            
            if (supabaseError) {
              // Check if error is due to table not existing
              if (supabaseError.code === '42P01' || supabaseError.message.includes('does not exist')) {
                console.warn(`❌ Table ${table} n'existe pas dans Supabase`);
                throw new Error('TABLE_NOT_EXISTS');
              }
              throw new Error(supabaseError.message);
            }
            
            console.log(`✅ Données Supabase récupérées:`, { table, count: supabaseData?.length });
            setData(supabaseData || []);
          } catch (supabaseErr) {
            // If table doesn't exist or other Supabase error, fall back to localStorage
            console.warn(`❌ Erreur Supabase ${table}:`, supabaseErr);
            setUsingLocalStorage(true);
            
            let stored = storage.get(`table_${table}`, []);
            
            // Si pas de données en cache et que c'est la table players, créer des données de démo
            if (stored.length === 0 && table === 'players') {
              stored = createDemoData(table);
              storage.set(`table_${table}`, stored);
              console.log(`🎭 Données de démonstration créées pour ${table}:`, stored.length);
            }
            
            setData(stored);
          }
        } else {
          // No Supabase configured, use localStorage
          console.log(`📱 Mode localStorage pour ${table}`);
          setUsingLocalStorage(true);
          
          let stored = storage.get(`table_${table}`, []);
          
          // Si pas de données en cache et que c'est la table players, créer des données de démo
          if (stored.length === 0 && table === 'players') {
            stored = createDemoData(table);
            storage.set(`table_${table}`, stored);
            console.log(`🎭 Données de démonstration créées (localStorage) pour ${table}:`, stored.length);
          }
          
          setData(stored);
        }
      } catch (err) {
        console.error(`❌ Erreur fatale lors du chargement ${table}:`, err);
        setUsingLocalStorage(true);
        
        let stored = storage.get(`table_${table}`, []);
        
        // Dernière chance : créer des données de démo si besoin
        if (stored.length === 0 && table === 'players') {
          stored = createDemoData(table);
          storage.set(`table_${table}`, stored);
          console.log(`🎭 Données de démonstration créées (fallback) pour ${table}:`, stored.length);
        }
        
        setData(stored);
        setError(`Erreur de chargement: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [table, JSON.stringify(filter), columnsToSelect]);

  // Enhanced CRUD helpers with better error handling
  const insert = async (values: T | T[]) => {
    try {
      if (supabase && !usingLocalStorage) {
        try {
          const { data: insertedData, error } = await supabase
            .from(table)
            .insert(Array.isArray(values) ? values : [values])
            .select();
            
          if (error) {
            if (error.code === '42P01' || error.message.includes('does not exist')) {
              throw new Error('TABLE_NOT_EXISTS');
            }
            throw new Error(error.message);
          }
          
          const newData = Array.isArray(insertedData) ? insertedData : [insertedData];
          setData(prev => [...prev, ...newData]);
          return { data: newData, error: null };
        } catch (supabaseErr) {
          console.warn(`Supabase insert failed for table ${table}, using localStorage:`, supabaseErr);
          setUsingLocalStorage(true);
        }
      }
      
      // localStorage fallback
      const current = storage.get(`table_${table}`, []);
      const newData = Array.isArray(values) ? values : [values];
      const dataWithIds = newData.map((item: any) => ({
        ...item,
        id: item.id || crypto.randomUUID(),
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString()
      }));
      const updated = [...current, ...dataWithIds];
      storage.set(`table_${table}`, updated);
      setData(updated);
      return { data: dataWithIds, error: null };
    } catch (err) {
      console.error(`Error inserting into table ${table}:`, err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };
  
  const update = async (id: any, values: Partial<T>) => {
    try {
      if (supabase && !usingLocalStorage) {
        try {
          const { data: updatedData, error } = await supabase
            .from(table)
            .update({ ...values, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();
            
          if (error) {
            if (error.code === '42P01' || error.message.includes('does not exist')) {
              throw new Error('TABLE_NOT_EXISTS');
            }
            throw new Error(error.message);
          }
          
          setData(prev => prev.map((item: any) => 
            item.id === id ? { ...item, ...values, updated_at: new Date().toISOString() } : item
          ));
          return { data: updatedData, error: null };
        } catch (supabaseErr) {
          console.warn(`Supabase update failed for table ${table}, using localStorage:`, supabaseErr);
          setUsingLocalStorage(true);
        }
      }
      
      // localStorage fallback
      const current = storage.get(`table_${table}`, []);
      const updated = current.map((item: any) => 
        item.id === id ? { ...item, ...values, updated_at: new Date().toISOString() } : item
      );
      storage.set(`table_${table}`, updated);
      setData(updated);
      return { data: values, error: null };
    } catch (err) {
      console.error(`Error updating table ${table}:`, err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };
  
  const remove = async (id: any) => {
    try {
      if (supabase && !usingLocalStorage) {
        try {
          const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);
            
          if (error) {
            if (error.code === '42P01' || error.message.includes('does not exist')) {
              throw new Error('TABLE_NOT_EXISTS');
            }
            throw new Error(error.message);
          }
          
          setData(prev => prev.filter((item: any) => item.id !== id));
          return { data: null, error: null };
        } catch (supabaseErr) {
          console.warn(`Supabase delete failed for table ${table}, using localStorage:`, supabaseErr);
          setUsingLocalStorage(true);
        }
      }
      
      // localStorage fallback
      const current = storage.get(`table_${table}`, []);
      const updated = current.filter((item: any) => item.id !== id);
      storage.set(`table_${table}`, updated);
      setData(updated);
      return { data: null, error: null };
    } catch (err) {
      console.error(`Error deleting from table ${table}:`, err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return { 
    data, 
    loading, 
    error, 
    insert, 
    update, 
    remove, 
    usingLocalStorage,
    refetch: () => {
      setLoading(true);
      // Re-run the effect by changing a dependency
    }
  };
}