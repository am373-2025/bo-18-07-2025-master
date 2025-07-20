import React, { useState, useRef } from "react";
import { Player } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { Trophy, MapPin, Users, Star, TrendingUp, TrendingDown } from "lucide-react";

interface SwipeCardsProps {
  players: Player[];
  onLike: (player: Player) => void;
  onDislike: () => void;
  likedIds: string[];
  isAnimating?: boolean;
  swipeDirection?: 'left' | 'right' | null;
}

function SwipeCards({ players, onLike, onDislike, likedIds, isAnimating, swipeDirection }: SwipeCardsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const player = players[0];
  if (!player) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (Math.abs(dragOffset.x) > 100) {
      if (dragOffset.x > 0) {
        onLike(player);
      } else {
        onDislike();
      }
    }
    
    setDragOffset({ x: 0, y: 0 });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setStartPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.x;
    const deltaY = touch.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (Math.abs(dragOffset.x) > 80) {
      if (dragOffset.x > 0) {
        onLike(player);
      } else {
        onDislike();
      }
    }
    
    setDragOffset({ x: 0, y: 0 });
  };

  const rotation = dragOffset.x * 0.1;
  const opacity = 1 - Math.abs(dragOffset.x) * 0.002;

  const getTrendIcon = (trend?: string) => {
    if (!trend) return null;
    if (trend.includes('+')) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend.includes('-')) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Card principale style Tinder */}
      <div
        ref={cardRef}
        className={`relative w-full aspect-[3/4] cursor-pointer select-none ${
          isAnimating ? 'transition-transform duration-300' : ''
        }`}
        style={{
          transform: isAnimating 
            ? `translateX(${swipeDirection === 'right' ? '100%' : swipeDirection === 'left' ? '-100%' : '0'}) rotate(${swipeDirection === 'right' ? '15deg' : swipeDirection === 'left' ? '-15deg' : '0deg'})`
            : `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
          opacity: isAnimating ? 0 : opacity,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Labels de swipe */}
        {dragOffset.x > 50 && (
          <div className="absolute top-8 right-8 z-20 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-lg rotate-12 shadow-2xl animate-pulse">
            LIKE ❤️
          </div>
        )}
        {dragOffset.x < -50 && (
          <div className="absolute top-8 left-8 z-20 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg -rotate-12 shadow-2xl animate-pulse">
            NOPE ✕
          </div>
        )}

        {/* Card content */}
        <div className="w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white/20">
          {/* Photo du joueur */}
          <div className="relative h-3/4 overflow-hidden">
            <img 
              src={player.photo} 
              alt={player.name}
              className="w-full h-full object-cover"
              draggable={false}
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Ranking badge */}
            {player.ranking && (
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md rounded-full px-3 py-1">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="text-white font-bold text-sm">#{player.ranking}</span>
                </div>
              </div>
            )}

            {/* Trend indicator */}
            {player.trend && (
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-full p-2">
                {getTrendIcon(player.trend)}
              </div>
            )}

            {/* Votes */}
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md rounded-full px-3 py-1">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-white font-bold text-sm">{(player.votes || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Informations du joueur */}
          <div className="h-1/4 p-6 bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {player.name}
                </h3>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {player.position}
                  </Badge>
                  {player.age && (
                    <Badge variant="outline" className="text-xs">
                      {player.age} ans
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{player.club}</span>
                  </div>
                  {player.country && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{player.country}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicators pour swipe */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-white/30" />
        <div className="w-2 h-2 rounded-full bg-white/30" />
        <div className="w-2 h-2 rounded-full bg-primary" />
        <div className="w-2 h-2 rounded-full bg-white/30" />
        <div className="w-2 h-2 rounded-full bg-white/30" />
      </div>
    </div>
  );
}

export default SwipeCards;