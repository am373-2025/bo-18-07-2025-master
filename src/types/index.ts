// Types centralisés pour l'application Ballon d'Or 2025

export interface Player {
  id: string;
  name: string;
  slug?: string;
  position: string;
  club: string;
  photo: string;
  votes: number;
  isLiked?: boolean; // État client-side uniquement
  stats?: PlayerStats;
  country?: string;
  age?: number;
  ranking?: number;
  trend?: 'up' | 'down' | 'stable';
  created_at?: string;
  updated_at?: string;
}

export interface PlayerStats {
  goals: number;
  assists: number;
  matches: number;
  rating?: number;
  yellowCards?: number;
  redCards?: number;
  minutesPlayed?: number;
  trophies?: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  email?: string;
  bio: string;
  avatar: string;
  followers: number;
  following: number;
  joinDate: string;
  favorites: string[];
  stats: UserStats;
  isAdmin?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserStats {
  votes: number;
  posts: number;
  likes: number;
  comments: number;
}

export interface UserVote {
  id: string;
  user_id: string;
  player_id: string;
  player_name: string;
  created_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  player_id: string;
  player_name: string;
  created_at: string;
}

export interface UserPost {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  post_type: 'text' | 'image' | 'video' | 'poll';
  poll_data?: PollData;
  likes: number;
  comments_count: number;
  shares: number;
  created_at: string;
  updated_at: string;
}

export interface PollData {
  question: string;
  options: PollOption[];
}

export interface PollOption {
  text: string;
  votes: number;
  voted: boolean;
}

export interface Comment {
  id: string;
  user_id: string;
  userName: string;
  userAvatar: string;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: Date;
  replies?: Comment[];
  parentId?: string;
  mentions?: string[];
}

export interface SharedTop {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  players: Player[];
  topType: 'top3' | 'top5' | 'top10';
  likes: number;
  shares: number;
  createdAt: Date;
  isLiked: boolean;
  comments: Comment[];
  commentCount: number;
}

export interface Post {
  id: string;
  user: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  image?: string;
  video?: string;
  poll?: {
    question: string;
    options: Array<{
      text: string;
      votes: number;
      voted: boolean;
    }>;
  };
  stats?: PlayerStats;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  type: 'post' | 'poll' | 'stats';
  isLiked: boolean;
  likedBy: string[];
  isFavorite: boolean;
  isReported: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName?: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'video';
}

export interface Conversation {
  id: string;
  type: 'private' | 'group';
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online?: boolean;
  participants?: number;
  description?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// Enum pour les positions
export enum PlayerPosition {
  GOALKEEPER = 'GK',
  DEFENDER = 'DEF', 
  MIDFIELDER = 'MID',
  FORWARD = 'FWD',
  ATTACKER = 'ATT'
}

// Enum pour les ligues
export enum League {
  PREMIER_LEAGUE = 'Premier League',
  LA_LIGA = 'La Liga',
  SERIE_A = 'Serie A',
  BUNDESLIGA = 'Bundesliga',
  LIGUE_1 = 'Ligue 1'
}

// Types pour l'authentification
export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
    avatar_url?: string;
  };
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}