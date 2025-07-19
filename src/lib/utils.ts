import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- API Football Service ---
const API_PROXY_BASE = import.meta.env.VITE_API_PROXY_URL || 'http://localhost:3001/api';

export async function fetchPlayerByName(name: string): Promise<any> {
  try {
    const res = await fetch(`${API_PROXY_BASE}/players?search=${encodeURIComponent(name)}&season=2023`, {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10s timeout
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn(`Failed to fetch player ${name}:`, error);
    // Return fallback structure
    return {
      response: [{
        player: {
          id: Math.random().toString(),
          name: name,
          photo: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=400&h=300&fit=crop`
        },
        statistics: [{
          games: { position: 'Unknown' },
          team: { name: 'Unknown Club' },
          goals: { total: 0, assists: 0 }
        }]
      }]
    };
  }
}

export async function fetchPlayerById(id: number): Promise<any> {
  try {
    const res = await fetch(`${API_PROXY_BASE}/players?id=${id}&season=2023`, {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn(`Failed to fetch player with ID ${id}:`, error);
    return { response: [] };
  }
}

// Utility functions
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
};

export const formatDate = (date: Date | string, format: "short" | "long" | "relative" = "short"): string => {
  const d = new Date(date);
  
  if (format === "relative") {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `il y a ${days} jour${days > 1 ? "s" : ""}`;
    if (hours > 0) return `il y a ${hours} heure${hours > 1 ? "s" : ""}`;
    if (minutes > 0) return `il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
    return "maintenant";
  }

  return d.toLocaleDateString("fr-FR", 
    format === "long" 
      ? { year: "numeric", month: "long", day: "numeric" }
      : { year: "numeric", month: "2-digit", day: "2-digit" }
  );
};

// --- TESTS API FOOTBALL ---
if (import.meta.vitest) {
  const { it, expect, vi } = import.meta.vitest;

  it('fetchPlayerByName fetches player data from API', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ response: [{ player: { id: 1, name: 'Test Player' }, statistics: [{}] }] })
    })));
    const data = await fetchPlayerByName('Test Player');
    expect(data.response[0].player.name).toBe('Test Player');
  });

  it('fetchPlayerById fetches player data from API', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ response: [{ player: { id: 2, name: 'Test Player 2' }, statistics: [{}] }] })
    })));
    const data = await fetchPlayerById(2);
    expect(data.response[0].player.id).toBe(2);
  });
}