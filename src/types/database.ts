// Types pour la base de données Supabase
export interface Database {
  public: {
    Tables: {
      players: {
        Row: Player;
        Insert: Omit<Player, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Player, 'id'>>;
      };
      profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id'>>;
      };
      user_posts: {
        Row: UserPost;
        Insert: Omit<UserPost, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserPost, 'id'>>;
      };
      user_votes: {
        Row: UserVote;
        Insert: Omit<UserVote, 'id' | 'created_at'>;
        Update: never;
      };
      user_favorites: {
        Row: UserFavorite;
        Insert: Omit<UserFavorite, 'id' | 'created_at'>;
        Update: never;
      };
      user_follows: {
        Row: UserFollow;
        Insert: Omit<UserFollow, 'id' | 'created_at'>;
        Update: never;
      };
      user_messages: {
        Row: UserMessage;
        Insert: Omit<UserMessage, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserMessage, 'id' | 'created_at'>>;
      };
      user_post_likes: {
        Row: UserPostLike;
        Insert: Omit<UserPostLike, 'id' | 'created_at'>;
        Update: never;
      };
      user_post_comments: {
        Row: UserPostComment;
        Insert: Omit<UserPostComment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserPostComment, 'id' | 'created_at'>>;
      };
    };
  };
}

// Types des entités
export interface Player {
  id: string;
  slug: string;
  name: string;
  position: string;
  club: string;
  photo: string;
  votes: number;
  country?: string;
  age?: number;
  ranking?: number;
  trend?: 'up' | 'down' | 'stable';
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  bio: string;
  avatar: string;
  followers: number;
  following: number;
  is_admin: boolean;
  stats: UserStats;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  votes: number;
  posts: number;
  likes: number;
  comments: number;
}

export interface UserPost {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  post_type: 'text' | 'image' | 'video' | 'poll';
  likes: number;
  comments_count: number;
  shares: number;
  created_at: string;
  updated_at: string;
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

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface UserMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPostLike {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface UserPostComment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  likes: number;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}