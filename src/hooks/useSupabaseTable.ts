import { useEffect, useState } from "react";
import { supabase, storage } from "@/lib/supabaseClient";

export function useSupabaseTable(table: string, filter?: Record<string, any>) {
  const [data, setData] = useState<any[]>([]);
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
            let query = supabase.from(table).select('*');
            
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
  }, [table, JSON.stringify(filter)]);

  // CRUD helpers
  const insert = async (values: any) => {
    try {
      if (supabase && !usingLocalStorage) {
        try {
          const { data: insertedData, error } = await supabase
            .from(table)
            .insert(values)
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
          // Fall back to localStorage on error
          console.warn(`Supabase insert failed for table ${table}, using localStorage:`, supabaseErr);
          setUsingLocalStorage(true);
        }
      }
      
      // localStorage fallback
      const current = storage.get(`table_${table}`, []);
      const newData = Array.isArray(values) ? values : [values];
      // Generate IDs for new items if they don't have one
      const dataWithIds = newData.map(item => ({
        ...item,
        id: item.id || Math.random().toString(36).substr(2, 9)
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
  
  const update = async (id: any, values: any) => {
    try {
      if (supabase && !usingLocalStorage) {
        try {
          const { data: updatedData, error } = await supabase
            .from(table)
            .update(values)
            .eq('id', id)
            .select();
            
          if (error) {
            if (error.code === '42P01' || error.message.includes('does not exist')) {
              throw new Error('TABLE_NOT_EXISTS');
            }
            throw new Error(error.message);
          }
          
          setData(prev => prev.map(item => 
            item.id === id ? { ...item, ...values } : item
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
        item.id === id ? { ...item, ...values } : item
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
          
          setData(prev => prev.filter(item => item.id !== id));
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

  return { data, loading, error, insert, update, remove, usingLocalStorage };
}
      } else {
        // Fallback to localStorage
        const current = storage.get(`table_${table}`, []);
        const newData = Array.isArray(values) ? values : [values];
        const updated = [...current, ...newData];
        storage.set(`table_${table}`, updated);
        setData(updated);
        return { data: newData, error: null };
      }
    } catch (err) {
      console.error(`Error inserting into table ${table}:`, err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };
  
  const update = async (id: any, values: any) => {
    try {
      if (supabase) {
        const { data: updatedData, error } = await supabase
          .from(table)
          .update(values)
          .eq('id', id)
          .select();
          
        if (error) throw new Error(error.message);
        
        setData(prev => prev.map(item => 
          item.id === id ? { ...item, ...values } : item
        ));
        return { data: updatedData, error: null };
      } else {
        // Fallback to localStorage
        const current = storage.get(`table_${table}`, []);
        const updated = current.map((item: any) => 
          item.id === id ? { ...item, ...values } : item
        );
        storage.set(`table_${table}`, updated);
        setData(updated);
        return { data: values, error: null };
      }
    } catch (err) {
      console.error(`Error updating table ${table}:`, err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };
  
  const remove = async (id: any) => {
    try {
      if (supabase) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id);
          
        if (error) throw new Error(error.message);
        
        setData(prev => prev.filter(item => item.id !== id));
        return { data: null, error: null };
      } else {
        // Fallback to localStorage
        const current = storage.get(`table_${table}`, []);
        const updated = current.filter((item: any) => item.id !== id);
        storage.set(`table_${table}`, updated);
        setData(updated);
        return { data: null, error: null };
      }
    } catch (err) {
      console.error(`Error deleting from table ${table}:`, err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return { data, loading, error, insert, update, remove };
} 