import React, { useState } from "react";
import { Heart, Share2, MessageCircle, Trophy, Crown, TrendingUp } from "lucide-react";
import CommentSection from "./CommentSection";
import { Player, SharedTop, Comment } from '@/types/types';

// Données mockées pour les tops populaires
const MOCK_POPULAR_TOPS: SharedTop[] = [
  {
    id: "1",
    userId: "user1",
    userName: "FootFan2024",
    userAvatar: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=50&h=50&fit=crop",
    title: "Les meilleurs de 2024",
    players: [
      { id: "1", name: "Kylian Mbappé", photo: "/src/assets/player-mbappe.jpg", likes: 1250 },
      { id: "2", name: "Erling Haaland", photo: "/src/assets/player-haaland.jpg", likes: 980 },
      { id: "3", name: "Jude Bellingham", photo: "/src/assets/player-bellingham.jpg", likes: 890 },
    ],
    topType: "top3",
    likes: 342,
    shares: 89,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
    isLiked: false,
    comments: [
      {
        id: "c1",
        userId: "user2",
        userName: "SoccerLover",
        userAvatar: "https://images.unsplash.com/photo-1556506751-69a7d6fb64dd?w=50&h=50&fit=crop",
        content: "Excellent top ! Mbappé mérite vraiment la première place cette année.",
        likes: 12,
        isLiked: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30min ago
        replies: [
          {
            id: "r1",
            userId: "user1",
            userName: "FootFan2024",
            userAvatar: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=50&h=50&fit=crop",
            content: "Merci ! Il a vraiment été exceptionnel cette saison.",
            likes: 5,
            isLiked: true,
            createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15min ago
          }
        ]
      },
      {
        id: "c2",
        userId: "user3",
        userName: "BallonDor",
        userAvatar: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=50&h=50&fit=crop",
        content: "Haaland en 2ème place ? Il mérite mieux selon moi !",
        likes: 8,
        isLiked: false,
        createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45min ago
      }
    ],
    commentCount: 2
  },
  {
    id: "2",
    userId: "user2",
    userName: "BallonDor",
    userAvatar: "https://images.unsplash.com/photo-1556506751-69a7d6fb64dd?w=50&h=50&fit=crop",
    title: "Mon Top 5 absolu",
    players: [
      { id: "7", name: "Lionel Messi", photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop", likes: 2100 },
      { id: "8", name: "Cristiano Ronaldo", photo: "https://images.unsplash.com/photo-1556506751-69a7d6fb64dd?w=100&h=100&fit=crop", likes: 1950 },
      { id: "1", name: "Kylian Mbappé", photo: "/src/assets/player-mbappe.jpg", likes: 1250 },
      { id: "2", name: "Erling Haaland", photo: "/src/assets/player-haaland.jpg", likes: 980 },
      { id: "3", name: "Jude Bellingham", photo: "/src/assets/player-bellingham.jpg", likes: 890 },
    ],
    topType: "top5",
    likes: 567,
    shares: 234,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5h ago
    isLiked: true,
    comments: [
      {
        id: "c3",
        userId: "user4",
        userName: "MessiFan",
        userAvatar: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=50&h=50&fit=crop",
        content: "Messi en première place, c'est évident ! 🐐",
        likes: 25,
        isLiked: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
      }
    ],
    commentCount: 1
  },
  {
    id: "3",
    userId: "user3",
    userName: "SoccerExpert",
    userAvatar: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=50&h=50&fit=crop",
    title: "Top 10 des légendes",
    players: [
      { id: "7", name: "Lionel Messi", photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop", likes: 2100 },
      { id: "8", name: "Cristiano Ronaldo", photo: "https://images.unsplash.com/photo-1556506751-69a7d6fb64dd?w=100&h=100&fit=crop", likes: 1950 },
      { id: "1", name: "Kylian Mbappé", photo: "/src/assets/player-mbappe.jpg", likes: 1250 },
      { id: "2", name: "Erling Haaland", photo: "/src/assets/player-haaland.jpg", likes: 980 },
      { id: "3", name: "Jude Bellingham", photo: "/src/assets/player-bellingham.jpg", likes: 890 },
      { id: "4", name: "Vinicius Jr", photo: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop", likes: 750 },
      { id: "5", name: "Kevin De Bruyne", photo: "https://images.unsplash.com/photo-1556506751-69a7d6fb64dd?w=100&h=100&fit=crop", likes: 720 },
      { id: "6", name: "Mohamed Salah", photo: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=100&h=100&fit=crop", likes: 680 },
      { id: "9", name: "Neymar Jr", photo: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=100&h=100&fit=crop", likes: 850 },
      { id: "10", name: "Robert Lewandowski", photo: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop", likes: 620 },
    ],
    topType: "top10",
    likes: 892,
    shares: 445,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    isLiked: false,
    comments: [],
    commentCount: 0
  },
  {
    id: "4",
    userId: "current-user",
    userName: "Vous",
    userAvatar: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=50&h=50&fit=crop",
    title: "Mon Top 5 personnel",
    players: [
      { id: "1", name: "Kylian Mbappé", photo: "/src/assets/player-mbappe.jpg", likes: 1250 },
      { id: "2", name: "Erling Haaland", photo: "/src/assets/player-haaland.jpg", likes: 980 },
      { id: "3", name: "Jude Bellingham", photo: "/src/assets/player-bellingham.jpg", likes: 890 },
      { id: "4", name: "Vinicius Jr", photo: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop", likes: 750 },
      { id: "5", name: "Kevin De Bruyne", photo: "https://images.unsplash.com/photo-1556506751-69a7d6fb64dd?w=100&h=100&fit=crop", likes: 720 },
    ],
    topType: "top5",
    likes: 15,
    shares: 3,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30min ago
    isLiked: false,
    comments: [
      {
        id: "c4",
        userId: "user5",
        userName: "FanClub",
        userAvatar: "https://images.unsplash.com/photo-1556506751-69a7d6fb64dd?w=50&h=50&fit=crop",
        content: "Super top ! J'aime beaucoup tes choix.",
        likes: 2,
        isLiked: false,
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10min ago
      }
    ],
    commentCount: 1
  }
];

type Props = {
  onLike?: (topId: string) => void;
  onShare?: (top: SharedTop) => void;
  onAddSharedTop?: (top: SharedTop) => void;
  sharedTops?: SharedTop[];
  onClose?: () => void;
};

export default function PopularTops({ onLike, onShare, onAddSharedTop, sharedTops = [], onClose }: Props) {
  const [tops, setTops] = useState<SharedTop[]>(MOCK_POPULAR_TOPS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'top3' | 'top5' | 'top10' | 'my-tops'>('all');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());



  const handleLike = (topId: string) => {
    setTops(prev => prev.map(top => 
      top.id === topId 
        ? { ...top, likes: top.isLiked ? top.likes - 1 : top.likes + 1, isLiked: !top.isLiked }
        : top
    ));
    onLike?.(topId);
  };

  const handleShare = (top: SharedTop) => {
    setTops(prev => prev.map(t => 
      t.id === top.id ? { ...t, shares: t.shares + 1 } : t
    ));
    onShare?.(top);
  };

  const handleAddComment = (topId: string, content: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      userId: "current-user",
      userName: "Vous",
      userAvatar: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=50&h=50&fit=crop",
      content,
      likes: 0,
      isLiked: false,
      createdAt: new Date()
    };

    setTops(prev => prev.map(top => 
      top.id === topId 
        ? { 
            ...top, 
            comments: [newComment, ...top.comments],
            commentCount: top.commentCount + 1
          }
        : top
    ));
  };

  const handleLikeComment = (topId: string, commentId: string) => {
    setTops(prev => prev.map(top => {
      if (top.id !== topId) return top;
      
      const updateCommentLikes = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
              isLiked: !comment.isLiked
            };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: updateCommentLikes(comment.replies)
            };
          }
          return comment;
        });
      };

      return {
        ...top,
        comments: updateCommentLikes(top.comments)
      };
    }));
  };

  const handleReplyToComment = (topId: string, commentId: string, content: string) => {
    const newReply: Comment = {
      id: `reply-${Date.now()}`,
      userId: "current-user",
      userName: "Vous",
      userAvatar: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=50&h=50&fit=crop",
      content,
      likes: 0,
      isLiked: false,
      createdAt: new Date()
    };

    setTops(prev => prev.map(top => {
      if (top.id !== topId) return top;
      
      const addReplyToComment = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply]
            };
          }
          return comment;
        });
      };

      return {
        ...top,
        comments: addReplyToComment(top.comments),
        commentCount: top.commentCount + 1
      };
    }));
  };

  const toggleCommentsExpanded = (topId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topId)) {
        newSet.delete(topId);
      } else {
        newSet.add(topId);
      }
      return newSet;
    });
  };

  // Combiner les tops mockés avec les tops partagés
  const allTops = [...sharedTops, ...tops];
  
  const filteredTops = allTops.filter(top => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'my-tops') return top.userId === 'current-user';
    return top.topType === activeFilter;
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `il y a ${days}j`;
    if (hours > 0) return `il y a ${hours}h`;
    return "à l'instant";
  };

  const getTopTypeIcon = (type: string) => {
    switch (type) {
      case 'top3': return '🥉';
      case 'top5': return '🏆';
      case 'top10': return '👑';
      default: return '🏅';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center min-h-screen">
      <div className="relative w-full max-w-lg mx-auto bg-gradient-to-br from-zinc-900 via-black to-neutral-900 rounded-2xl shadow-gold p-4 md:p-8 overflow-y-auto max-h-[90vh] flex flex-col pt-12">
        {/* Bouton de fermeture */}
        <button
          className="absolute top-3 right-3 text-gold hover:text-yellow-400 text-2xl font-bold z-50 bg-black/80 rounded-full px-3 py-1"
          onClick={onClose}
          aria-label="Fermer"
        >✕</button>
        <div className="space-y-4">
          {/* Header avec filtres */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <h3 className="text-white font-semibold">Tops populaires</h3>
            </div>
            
            <div className="flex gap-1">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  activeFilter === 'all' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setActiveFilter('my-tops')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  activeFilter === 'my-tops' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Mes tops
              </button>
              <button
                onClick={() => setActiveFilter('top3')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  activeFilter === 'top3' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Top 3
              </button>
              <button
                onClick={() => setActiveFilter('top5')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  activeFilter === 'top5' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Top 5
              </button>
            </div>
          </div>

          {/* Liste des tops */}
          <div className="space-y-3">
            {filteredTops.map((top) => (
              <div key={top.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                {/* Header du top */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={top.userAvatar}
                      alt={top.userName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-white font-medium text-sm">{top.userName}</p>
                      <p className="text-slate-400 text-xs">{formatTimeAgo(top.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTopTypeIcon(top.topType)}</span>
                    <span className="text-slate-400 text-xs uppercase">{top.topType}</span>
                  </div>
                </div>

                {/* Titre */}
                <h4 className="text-white font-semibold mb-3">{top.title}</h4>

                {/* Joueurs - Podium Style */}
                <div className="mb-3">
                  {top.topType === 'top3' ? (
                    // Podium layout for top 3
                    <div className="flex items-end justify-center gap-2">
                      {/* 2nd place */}
                      <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                          <img
                            src={top.players[1]?.photo}
                            alt={top.players[1]?.name}
                            className="w-14 h-14 rounded-full object-cover border-2"
                            style={{ borderColor: '#C0C0C0' }}
                          />
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-black/80 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">🥈</span>
                          </div>
                        </div>
                        <div className="bg-slate-700 rounded-lg px-3 py-2 min-w-[80px] text-center">
                          <p className="text-white text-xs font-medium truncate">
                            {top.players[1]?.name}
                          </p>
                          <p className="text-slate-400 text-xs">2ème</p>
                        </div>
                      </div>

                      {/* 1st place */}
                      <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                          <img
                            src={top.players[0]?.photo}
                            alt={top.players[0]?.name}
                            className="w-16 h-16 rounded-full object-cover border-2"
                            style={{ borderColor: '#FFD700' }}
                          />
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-black/80 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">🥇</span>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg px-3 py-2 min-w-[80px] text-center">
                          <p className="text-white text-xs font-medium truncate">
                            {top.players[0]?.name}
                          </p>
                          <p className="text-yellow-100 text-xs">1er</p>
                        </div>
                      </div>

                      {/* 3rd place */}
                      <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                          <img
                            src={top.players[2]?.photo}
                            alt={top.players[2]?.name}
                            className="w-14 h-14 rounded-full object-cover border-2"
                            style={{ borderColor: '#CD7F32' }}
                          />
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-black/80 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">🥉</span>
                          </div>
                        </div>
                        <div className="bg-slate-700 rounded-lg px-3 py-2 min-w-[80px] text-center">
                          <p className="text-white text-xs font-medium truncate">
                            {top.players[2]?.name}
                          </p>
                          <p className="text-slate-400 text-xs">3ème</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Horizontal layout for top 5 and top 10
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {top.players.map((player, index) => (
                        <div key={player.id} className="relative flex-shrink-0">
                          <div className="relative">
                            <img
                              src={player.photo}
                              alt={player.name}
                              className="w-12 h-12 rounded-full object-cover border-2"
                              style={{
                                borderColor: index === 0 ? '#FFD700' : 
                                           index === 1 ? '#C0C0C0' : 
                                           index === 2 ? '#CD7F32' : '#4B5563'
                              }}
                            />
                            
                            {/* Rank Badge */}
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-black/80 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                              </span>
                            </div>
                          </div>
                          <p className="text-white text-xs text-center mt-1 truncate w-12">
                            {player.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(top.id)}
                    className={`flex items-center gap-1 text-sm transition-colors px-3 py-1 rounded-lg cursor-pointer ${
                      top.isLiked 
                        ? 'text-red-400 bg-red-400/10' 
                        : 'text-slate-400 hover:text-red-400 hover:bg-slate-700/50'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${top.isLiked ? 'fill-current' : ''}`} />
                    <span>{top.likes}</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare(top)}
                    className="flex items-center gap-1 text-slate-400 hover:text-blue-400 text-sm transition-colors px-3 py-1 rounded-lg hover:bg-slate-700/50 active:bg-slate-600/50 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{top.shares}</span>
                  </button>

                  <button
                    onClick={() => toggleCommentsExpanded(top.id)}
                    className="flex items-center gap-1 text-slate-400 hover:text-green-400 text-sm transition-colors px-3 py-1 rounded-lg hover:bg-slate-700/50 active:bg-slate-600/50 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{top.commentCount}</span>
                  </button>
                </div>

                {/* Section Commentaires */}
                {expandedComments.has(top.id) && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <CommentSection
                      topId={top.id}
                      comments={top.comments}
                      onComment={(content) => handleAddComment(top.id, content)}
                      onLike={(commentId) => handleLikeComment(top.id, commentId)}
                      onReply={(commentId, content) => handleReplyToComment(top.id, commentId, content)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredTops.length === 0 && (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Aucun top trouvé</p>
              <p className="text-slate-500 text-sm mt-1">Soyez le premier à partager votre top !</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 