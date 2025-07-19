import { useState } from "react";
import { Player } from "@/types/types";

export function useMyTop(initialPlayers: Player[] = []) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);

  const addPlayer = (player: Player) => {
    setPlayers(prev => [...prev, player]);
  };

  const removePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  const resetTop = () => {
    setPlayers([]);
  };

  return { players, addPlayer, removePlayer, resetTop };
} 