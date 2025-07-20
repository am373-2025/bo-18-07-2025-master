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
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>;
      };
      chat_groups: {
        Row: ChatGroup;
        Insert: Omit<ChatGroup, 'id' | 'created_at' | 'updated_at' | 'member_count'>;
        Update: Partial<Omit<ChatGroup, 'id' | 'created_at'>>;
      };
      chat_group_members: {
        Row: ChatGroupMember;
        Insert: Omit<ChatGroupMember, 'id' | 'joined_at'>;
        Update: Partial<Omit<ChatGroupMember, 'id' | 'joined_at'>>;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: Omit<ChatMessage, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ChatMessage, 'id' | 'created_at'>>;
      };
      user_sessions: {
        Row: UserSession;
        Insert: Omit<UserSession, 'id' | 'created_at'>;
        Update: Partial<Omit<UserSession, 'id' | 'created_at'>>;
      };
      app_settings: {
        Row: AppSetting;
        Insert: Omit<AppSetting, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AppSetting, 'id' | 'created_at'>>;
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
  stats?: {
    goals: number;
    assists: number;
    matches: number;
    rating: number;
  };
  biography?: string;
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
  email?: string;
  followers: number;
  following: number;
  is_admin: boolean;
  stats: UserStats;
  last_seen: string;
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
  poll_data?: {
    question: string;
    options: Array<{
      text: string;
      votes: number;
      voted: boolean;
    }>;
  };
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

export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'comment' | 'vote' | 'trophy' | 'follow' | 'message';
  title: string;
  content: string;
  data: any;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatGroup {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  created_by: string;
  is_public: boolean;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  group_id?: string;
  receiver_id?: string;
  content: string;
  message_type: 'text' | 'image' | 'video' | 'file';
  media_url?: string;
  reply_to?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  device_info: any;
  last_activity: string;
  expires_at: string;
  created_at: string;
}

export interface AppSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}