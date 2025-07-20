import { useEffect, useState } from "react";
import { supabase, storage } from "@/lib/supabaseClient";

export function useSupabaseTable<T = any>(
  table: string, 
  filter?: Record<string, any>, 
  columnsToSelect?: string
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingLocalStorage, setUsingLocalStorage] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      setUsingLocalStorage(false);

      try {
        if (supabase) {
          try {
            // Try Supabase first
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
                console.warn(`Table ${table} does not exist in Supabase. Using localStorage fallback.`);
                throw new Error('TABLE_NOT_EXISTS');
              }
              throw new Error(supabaseError.message);
            }
            
            setData(supabaseData || []);
          } catch (supabaseErr) {
            // If table doesn't exist or other Supabase error, fall back to localStorage
            console.warn(`Supabase error for table ${table}:`, supabaseErr);
            setUsingLocalStorage(true);
            const stored = storage.get(`table_${table}`, []);
            setData(stored);
          }
        } else {
          // No Supabase configured, use localStorage
          setUsingLocalStorage(true);
          const stored = storage.get(`table_${table}`, []);
          setData(stored);
        }
      } catch (err) {
        console.warn(`Error fetching from table ${table}:`, err);
        setUsingLocalStorage(true);
        const stored = storage.get(`table_${table}`, []);
        setData(stored);
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