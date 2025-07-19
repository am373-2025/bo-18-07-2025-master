import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- API Football Service ---
const API_PROXY_BASE = 'http://localhost:3001/api';

export async function fetchPlayerByName(name: string) {
  const res = await fetch(`${API_PROXY_BASE}/players?search=${encodeURIComponent(name)}&season=2023`);
  if (!res.ok) throw new Error('Erreur API Football (proxy)');
  const data = await res.json();
  return data;
}

export async function fetchPlayerById(id: number) {
  const res = await fetch(`${API_PROXY_BASE}/players?id=${id}&season=2023`);
  if (!res.ok) throw new Error('Erreur API Football (proxy)');
  const data = await res.json();
  return data;
}

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
