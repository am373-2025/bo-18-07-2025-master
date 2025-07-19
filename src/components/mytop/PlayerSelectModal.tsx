import React, { useState } from "react";
import { Player } from "@/types/types";

interface PlayerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (player: Player) => void;
  players: Player[];
}

const PlayerSelectModal: React.FC<PlayerSelectModalProps> = ({ isOpen, onClose, onSelect, players }) => {
  const [search, setSearch] = useState("");
  const filtered = players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center md:items-center">
      <div className="bg-card w-full max-w-md rounded-t-lg p-4 shadow-lg animate-slide-up">
        <div className="flex items-center mb-2">
          <input
            type="text"
            placeholder="Rechercher un joueur..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 border rounded px-2 py-1"
            autoFocus
          />
          <button onClick={onClose} className="ml-2 text-gray-500 text-xl">✕</button>
        </div>
        <ul className="max-h-64 overflow-y-auto divide-y">
          {filtered.length === 0 ? (
            <li className="text-center text-gray-400 py-4">Aucun joueur trouvé</li>
          ) : (
            filtered.map(player => (
              <li
                key={player.id}
                className="flex items-center gap-3 py-2 cursor-pointer hover:bg-muted rounded"
                onClick={() => { onSelect(player); onClose(); }}
              >
                <img src={player.photo} alt={player.name} className="w-8 h-8 rounded-full" />
                <span>{player.name}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default PlayerSelectModal; 