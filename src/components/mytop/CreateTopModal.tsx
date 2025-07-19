import React from "react";

function CreateTopModal({ isOpen, onClose, likedPlayers, onRemoveLike, onReorder, onValidate, onContinueSwipe }) {
  if (!isOpen) return null;
  // Pour la démo, on affiche juste la liste des ids likés
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center md:items-center">
      <div className="bg-card w-full max-w-md rounded-t-lg p-4 shadow-lg animate-slide-up">
        <h2 className="font-bold text-lg mb-2">Créer mon top {likedPlayers.length}</h2>
        <ul className="mb-4">
          {likedPlayers.map((id, idx) => (
            <li key={id} className="flex items-center gap-2 mb-2">
              <span className="font-bold">#{idx + 1}</span>
              <span>ID joueur : {id}</span>
              <button onClick={() => onRemoveLike(id)} className="ml-auto text-red-500">Supprimer</button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 mt-4">
          <button className="btn-outline flex-1" onClick={onContinueSwipe}>Poursuivre le swipe</button>
          <button className="btn-golden flex-1" onClick={onValidate}>Créer le top</button>
        </div>
      </div>
    </div>
  );
}

export default CreateTopModal; 