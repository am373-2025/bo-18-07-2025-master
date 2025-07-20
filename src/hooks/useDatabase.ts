import { useState, useEffect, useCallback } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import type { SupabaseTable, SupabaseRow, SupabaseInsert, SupabaseUpdate } from '@/lib/supabase';
import { useToast } from './use-toast';

interface DatabaseState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  count: number;
}

interface DatabaseActions<T extends SupabaseTable> {
  create: (data: SupabaseInsert<T>) => Promise<SupabaseRow<T> | null>;
  update: (id: string, data: SupabaseUpdate<T>) => Promise<SupabaseRow<T> | null>;
  remove: (id: string) => Promise<boolean>;
  refresh: () => void;
  subscribe: (callback: (payload: any) => void) => () => void;
}

const STORAGE_PREFIX = 'ballondor_';

export function useDatabase<T extends SupabaseTable>(
  table: T,
  options?: {
    filter?: Record<string, any>;
    select?: string;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    realtime?: boolean;
  }
): [DatabaseState<SupabaseRow<T>>, DatabaseActions<T>] {
  const [state, setState] = useState<DatabaseState<SupabaseRow<T>>>({
    data: [],
    loading: true,
    error: null,
    count: 0
  });
  
  const { toast } = useToast();
  const storageKey = `${STORAGE_PREFIX}${table}`;

  // Chargement initial des données
  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    if (supabase) {
      try {
        let query = supabase
          .from(table)
          .select(options?.select || '*', { count: 'exact' });

        // Filtres
        if (options?.filter) {
          Object.entries(options.filter).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }

        // Tri
        if (options?.orderBy) {
          query = query.order(options.orderBy.column, { 
            ascending: options.orderBy.ascending ?? false 
          });
        }

        // Limite
        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        setState({
          data: data as SupabaseRow<T>[],
          loading: false,
          error: null,
          count: count || 0
        });

        // Sauvegarde en cache local
        localStorage.setItem(storageKey, JSON.stringify(data));

      } catch (error: any) {
        const errorMessage = handleSupabaseError(error);
        console.warn(`Supabase error for ${table}:`, errorMessage);
        
        // Fallback vers localStorage
        const cached = localStorage.getItem(storageKey);
        const fallbackData = cached ? JSON.parse(cached) : [];
        
        setState({
          data: fallbackData,
          loading: false,
          error: `Mode hors ligne: ${errorMessage}`,
          count: fallbackData.length
        });
      }
    } else {
      // Mode localStorage uniquement
      const cached = localStorage.getItem(storageKey);
      const data = cached ? JSON.parse(cached) : [];
      
      setState({
        data,
        loading: false,
        error: null,
        count: data.length
      });
    }
  }, [table, options, storageKey]);

  // Effet initial
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions CRUD
  const create = useCallback(async (data: SupabaseInsert<T>): Promise<SupabaseRow<T> | null> => {
    if (supabase) {
      try {
        const { data: result, error } = await supabase
          .from(table)
          .insert(data)
          .select()
          .single();

        if (error) throw error;

        setState(prev => ({
          ...prev,
          data: [result, ...prev.data],
          count: prev.count + 1
        }));

        return result;
      } catch (error: any) {
        toast({
          title: "Erreur de création",
          description: handleSupabaseError(error),
          variant: "destructive"
        });
        return null;
      }
    } else {
      // Fallback localStorage
      const newItem = {
        ...data,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as SupabaseRow<T>;

      const current = state.data;
      const updated = [newItem, ...current];
      
      setState(prev => ({
        ...prev,
        data: updated,
        count: updated.length
      }));
      
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return newItem;
    }
  }, [table, state.data, storageKey, toast]);

  const update = useCallback(async (id: string, data: SupabaseUpdate<T>): Promise<SupabaseRow<T> | null> => {
    if (supabase) {
      try {
        const { data: result, error } = await supabase
          .from(table)
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        setState(prev => ({
          ...prev,
          data: prev.data.map(item => item.id === id ? result : item)
        }));

        return result;
      } catch (error: any) {
        toast({
          title: "Erreur de mise à jour",
          description: handleSupabaseError(error),
          variant: "destructive"
        });
        return null;
      }
    } else {
      // Fallback localStorage
      const updated = state.data.map(item => 
        item.id === id 
          ? { ...item, ...data, updated_at: new Date().toISOString() }
          : item
      );
      
      setState(prev => ({ ...prev, data: updated }));
      localStorage.setItem(storageKey, JSON.stringify(updated));
      
      return updated.find(item => item.id === id) || null;
    }
  }, [table, state.data, storageKey, toast]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id);

        if (error) throw error;

        setState(prev => ({
          ...prev,
          data: prev.data.filter(item => item.id !== id),
          count: prev.count - 1
        }));

        return true;
      } catch (error: any) {
        toast({
          title: "Erreur de suppression",
          description: handleSupabaseError(error),
          variant: "destructive"
        });
        return false;
      }
    } else {
      // Fallback localStorage
      const updated = state.data.filter(item => item.id !== id);
      setState(prev => ({ ...prev, data: updated, count: updated.length }));
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return true;
    }
  }, [table, state.data, storageKey, toast]);

  const subscribe = useCallback((callback: (payload: any) => void): (() => void) => {
    if (!supabase || !options?.realtime) {
      return () => {};
    }

    const subscription = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table },
        callback
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [table, options?.realtime]);

  return [
    state,
    {
      create,
      update,
      remove,
      refresh: loadData,
      subscribe
    }
  ];
}