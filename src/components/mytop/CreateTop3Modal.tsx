import React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface Player {
  id: string;
  name: string;
  photo?: string;
}

interface CreateTop3ModalProps {
  isOpen: boolean;
  onClose: () => void;
  likedPlayers: Player[];
  onRemoveLike: (id: string) => void;
  onReorder: (newOrder: Player[]) => void;
  onValidate: (orderedPlayers: Player[]) => void;
  onContinueSwipe: () => void;
}

const CreateTop3Modal: React.FC<CreateTop3ModalProps> = ({ isOpen, onClose, likedPlayers, onRemoveLike, onReorder, onValidate, onContinueSwipe }) => {
  const [players, setPlayers] = React.useState<Player[]>(likedPlayers);

  React.useEffect(() => {
    setPlayers(likedPlayers);
  }, [likedPlayers, isOpen]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(players);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setPlayers(reordered);
    onReorder(reordered);
  };

  // Déplacement manuel haut/bas
  const movePlayer = (from: number, to: number) => {
    if (to < 0 || to >= players.length) return;
    const reordered = Array.from(players);
    const [removed] = reordered.splice(from, 1);
    reordered.splice(to, 0, removed);
    setPlayers(reordered);
    onReorder(reordered);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/80 via-primary/80 to-secondary/80 animate-fade-in">
      <div className="bg-gradient-to-br from-background/90 to-card/80 w-full max-w-md mx-auto rounded-3xl p-8 shadow-2xl border border-primary/30 flex flex-col relative overflow-hidden animate-slide-up-2025">
        <h2 className="font-extrabold text-2xl mb-6 text-center text-gradient-gold tracking-wider uppercase drop-shadow-lg">Créer mon top 3</h2>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="top3-list">
            {(provided) => (
              <ul ref={provided.innerRef} {...provided.droppableProps} className="mb-8 space-y-4">
                {players.map((player, idx) => (
                  <Draggable key={player.id} draggableId={player.id} index={idx}>
                    {(provided, snapshot) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`flex items-center gap-3 bg-gradient-to-r from-slate-900/80 to-slate-800/60 rounded-2xl p-4 shadow-lg border border-primary/10 transition-all ${snapshot.isDragging ? 'ring-2 ring-primary scale-105' : ''}`}
                      >
                        <span className="font-black text-xl w-8 text-center text-gradient-gold drop-shadow">#{idx + 1}</span>
                        {player.photo && (
                          <img src={player.photo} alt={player.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary shadow-md" />
                        )}
                        <span className="font-semibold text-white flex-1 truncate text-lg">{player.name}</span>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => movePlayer(idx, idx - 1)}
                            className="rounded-full bg-slate-700/80 hover:bg-primary/80 text-white w-7 h-7 flex items-center justify-center mb-1 shadow"
                            aria-label="Monter"
                            disabled={idx === 0}
                          >
                            <span className="text-lg">▲</span>
                          </button>
                          <button
                            onClick={() => movePlayer(idx, idx + 1)}
                            className="rounded-full bg-slate-700/80 hover:bg-primary/80 text-white w-7 h-7 flex items-center justify-center shadow"
                            aria-label="Descendre"
                            disabled={idx === players.length - 1}
                          >
                            <span className="text-lg">▼</span>
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveLike(player.id)}
                          className="ml-2 text-red-500 hover:text-red-700 text-sm px-3 py-1 rounded-full bg-red-500/10 transition-colors shadow"
                          aria-label="Supprimer"
                        >
                          ✕
                        </button>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
        <div className="flex flex-col gap-4 mt-2">
          <button className="btn-outline w-full py-3 text-base font-semibold rounded-xl" onClick={onContinueSwipe}>Poursuivre le swipe</button>
          <button
            className="btn-golden w-full text-lg font-extrabold py-4 rounded-xl shadow-lg tracking-wider"
            onClick={() => onValidate(players)}
            disabled={players.length !== 3}
          >
            Créer le top
          </button>
        </div>
        <button className="absolute top-4 right-4 text-slate-400 hover:text-red-400 text-2xl" onClick={onClose} aria-label="Fermer">✕</button>
      </div>
    </div>
  );
};

export default CreateTop3Modal; 