import React from "react";
import { SharedTop } from '@/types/types';

interface PopularTopsProps {
  tops: SharedTop[];
  onSelect: (top: SharedTop) => void;
}

const PopularTops: React.FC<PopularTopsProps> = ({ tops, onSelect }) => (
  <div className="mt-6">
    <h2 className="font-bold mb-2 text-lg">Tops populaires</h2>
    <ul className="space-y-2">
      {tops.length === 0 ? (
        <li className="text-gray-400 text-sm">Aucun top populaire pour l'instant.</li>
      ) : (
        tops.map(top => (
          <li key={top.id} className="bg-card rounded p-2 shadow flex items-center justify-between">
            <span>{top.players.slice(0, 3).map(p => p.name).join(", ")}</span>
            <button onClick={() => onSelect(top)} className="btn-golden text-xs ml-2">Voir</button>
          </li>
        ))
      )}
    </ul>
  </div>
);

export default PopularTops; 