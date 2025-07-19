import React, { useRef, useState } from "react";
import { Player } from "@/types/types";

interface PlayerSwiperProps {
  players: Player[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onReorder: (from: number, to: number) => void;
}

const PlayerSwiper: React.FC<PlayerSwiperProps> = ({ players, onAdd, onRemove, onReorder }) => {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragItemRef = useRef<HTMLLIElement | null>(null);

  // Gestion drag & drop souris/tactile
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };
  const handleDragEnter = (idx: number) => {
    setDragOverIdx(idx);
  };
  const handleDragEnd = () => {
    if (draggedIdx !== null && dragOverIdx !== null && draggedIdx !== dragOverIdx) {
      onReorder(draggedIdx, dragOverIdx);
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  // Touch events (mobile)
  const handleTouchStart = (idx: number) => setDraggedIdx(idx);
  const handleTouchMove = (e: React.TouchEvent, idx: number) => {
    setDragOverIdx(idx);
  };
  const handleTouchEnd = () => handleDragEnd();

  return (
    <div className="flex flex-col gap-2">
      {players.length === 0 ? (
        <div className="text-center text-gray-400">Votre top est vide.</div>
      ) : (
        <ul className="space-y-2">
          {players.map((player, idx) => (
            <li
              key={player.id}
              ref={draggedIdx === idx ? dragItemRef : null}
              className={`flex items-center bg-card rounded p-2 shadow transition-all duration-200 ${dragOverIdx === idx ? 'ring-2 ring-primary' : ''}`}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragEnter={() => handleDragEnter(idx)}
              onDragEnd={handleDragEnd}
              onTouchStart={() => handleTouchStart(idx)}
              onTouchMove={e => handleTouchMove(e, idx)}
              onTouchEnd={handleTouchEnd}
            >
              <span className="cursor-move mr-2 text-lg" aria-label="Déplacer">☰</span>
              <img src={player.photo} alt={player.name} className="w-10 h-10 rounded-full mr-3" />
              <span className="flex-1 font-medium">{idx + 1}. {player.name}</span>
              <button onClick={() => onRemove(player.id)} className="text-red-500 ml-2" aria-label="Supprimer">
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={onAdd} className="btn-golden w-full mt-2" aria-label="Ajouter un joueur">+ Ajouter un joueur</button>
    </div>
  );
};

export default PlayerSwiper; 