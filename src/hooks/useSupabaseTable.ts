import { useEffect, useState } from "react";

export function useSupabaseTable(table: string, filter?: Record<string, any>) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Use localStorage instead of Supabase
      const stored = localStorage.getItem(`table_${table}`);
      setData(stored ? JSON.parse(stored) : []);
      setLoading(false);
    }
    fetchData();
  }, [table, JSON.stringify(filter)]);

  // CRUD helpers
  const insert = (values: any) => {
    const current = JSON.parse(localStorage.getItem(`table_${table}`) || '[]');
    const newData = Array.isArray(values) ? values : [values];
    const updated = [...current, ...newData];
    localStorage.setItem(`table_${table}`, JSON.stringify(updated));
    setData(updated);
    return Promise.resolve({ data: newData, error: null });
  };
  
  const update = (id: any, values: any) => {
    const current = JSON.parse(localStorage.getItem(`table_${table}`) || '[]');
    const updated = current.map((item: any) => item.id === id ? { ...item, ...values } : item);
    localStorage.setItem(`table_${table}`, JSON.stringify(updated));
    setData(updated);
    return Promise.resolve({ data: values, error: null });
  };
  
  const remove = (id: any) => {
    const current = JSON.parse(localStorage.getItem(`table_${table}`) || '[]');
    const updated = current.filter((item: any) => item.id !== id);
    localStorage.setItem(`table_${table}`, JSON.stringify(updated));
    setData(updated);
    return Promise.resolve({ data: null, error: null });
  };

  return { data, loading, insert, update, remove };
} 