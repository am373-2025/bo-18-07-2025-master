import React from "react";

function PlayerCard({ player, liked }) {
  return (
    <div
      className="relative bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 flex flex-col items-center w-[90vw] max-w-[420px] min-h-[420px] md:w-[350px] md:min-h-[420px] transition-all duration-300 border-2 border-transparent border-pink-500 scale-105 hover:scale-105 mx-auto animate-fade-in"
    >
      <div className="relative mb-4">
        <img
          className="w-40 h-40 rounded-full object-cover border-4 border-gold shadow-xl"
          src={player.photo}
          alt={player.name}
        />
        {liked && (
          <span className="absolute -top-3 -right-3 bg-pink-500 text-white rounded-full px-4 py-2 text-base font-bold animate-bounce shadow-xl">❤️</span>
        )}
      </div>
      <h2 className="text-2xl font-extrabold mb-2 text-center text-gradient-gold drop-shadow-lg uppercase tracking-wide">{player.name}</h2>
      <div className="flex items-center gap-2 mb-3">
        {player.club && <span className="bg-gold/20 text-gold px-2 py-1 rounded-full text-xs font-semibold shadow">{player.club}</span>}
        {player.country && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold shadow">{player.country}</span>}
      </div>
      {liked && (
        <div className="text-pink-500 font-bold mt-4 animate-pulse text-lg">Ajouté à ton top !</div>
      )}
    </div>
  );
}

export default PlayerCard; 