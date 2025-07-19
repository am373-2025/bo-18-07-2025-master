export type Player = {
  id: string;
  name: string;
  photo: string;
  club?: string;
  country?: string;
  likes?: number;
};

export type Comment = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: Date;
  replies?: Comment[];
};

export type SharedTop = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  players: Player[];
  topType: string;
  likes: number;
  shares: number;
  createdAt: Date;
  isLiked: boolean;
  comments: Comment[];
  commentCount: number;
}; 