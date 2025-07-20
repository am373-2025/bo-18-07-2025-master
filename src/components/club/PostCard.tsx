import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Share2, Trophy, Send, Play } from "lucide-react";
import { PostActionsMenu } from "@/components/ui/post-actions-menu";

interface Post {
  id: string;
  user: {
    id: string;
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
  stats?: {
    goals: number;
    assists: number;
    matches: number;
  };
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  type: "post" | "poll" | "stats";
  isLiked: boolean;
  isFavorite: boolean;
  isReported: boolean;
  canEdit?: boolean;
}

interface PostCardProps {
  post: Post;
  currentUserId: string;
  userProfile: any;
  onLike: (postId: string) => void;
  onShare: (post: Post) => void;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
  onVotePoll: (postId: string, optionIndex: number) => void;
  onUserClick: (userId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  showCommentInput: string | null;
  setShowCommentInput: (postId: string | null) => void;
  commentInput: string;
  setCommentInput: (value: string) => void;
  postComments: { [key: string]: any[] };
}

export const PostCard = ({
  post,
  currentUserId,
  userProfile,
  onLike,
  onShare,
  onEdit,
  onDelete,
  onVotePoll,
  onUserClick,
  onAddComment,
  showCommentInput,
  setShowCommentInput,
  commentInput,
  setCommentInput,
  postComments
}: PostCardProps) => {
  return (
    <Card className="card-golden overflow-hidden">
      <CardContent className="p-4 space-y-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar 
            className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all flex-shrink-0"
            onClick={() => onUserClick(post.user.id)}
          >
            <AvatarImage src={post.user.avatar} />
            <AvatarFallback>{post.user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 
                className="font-semibold text-sm cursor-pointer hover:text-primary transition-colors truncate"
                onClick={() => onUserClick(post.user.id)}
              >
                {post.user.name}
              </h3>
              {post.user.verified && (
                <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5 flex-shrink-0">
                  <Trophy className="w-3 h-3 mr-1" />
                  Vérifié
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{post.timestamp}</p>
          </div>
          <PostActionsMenu
            postId={post.id}
            isOwnPost={post.canEdit || false}
            onEdit={() => onEdit(post)}
            onDelete={() => onDelete(post.id)}
            onFavorite={() => {}}
            onReport={() => {}}
            onShare={() => onShare(post)}
            isFavorited={post.isFavorite}
            isReported={post.isReported}
          />
        </div>

        {/* Content */}
        <div className="overflow-hidden">
          {post.content && (
            <p className="text-sm leading-relaxed mb-3 break-words">{post.content}</p>
          )}
          
          {post.image && (
            <img 
              src={post.image} 
              alt="Post image"
              className="w-full rounded-lg mb-3 max-w-full h-auto object-cover max-h-80"
              onError={(e) => {
                console.error('Image failed to load:', post.image);
                e.currentTarget.style.display = 'none';
              }}
            />
          )}

          {post.video && (
            <div className="relative mb-3">
              <video 
                src={post.video} 
                className="w-full rounded-lg max-w-full h-auto max-h-80"
                controls
                playsInline
                preload="metadata"
                onError={(e) => {
                  console.error('Video failed to load:', post.video);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {post.poll && (
            <div className="space-y-3 mb-3 overflow-hidden">
              <h4 className="font-semibold text-sm">{post.poll.question}</h4>
              <div className="space-y-2">
                {post.poll.options.map((option: any, optionIndex: number) => {
                  const totalVotes = post.poll!.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);
                  const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                  
                  return (
                    <Button
                      key={optionIndex}
                      variant={option.voted ? "default" : "outline"}
                      className="w-full justify-between p-3 h-auto text-left overflow-hidden"
                      onClick={() => onVotePoll(post.id, optionIndex)}
                    >
                      <span className="text-sm truncate flex-1 mr-2">{option.text}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs">{option.votes}</span>
                        <span className="text-xs text-muted-foreground">({percentage}%)</span>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {post.stats && (
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center bg-muted/50 rounded-lg p-3">
                <div className="text-lg font-bold text-primary">{post.stats.goals}</div>
                <div className="text-xs text-muted-foreground">Buts</div>
              </div>
              <div className="text-center bg-muted/50 rounded-lg p-3">
                <div className="text-lg font-bold text-primary">{post.stats.assists}</div>
                <div className="text-xs text-muted-foreground">Passes</div>
              </div>
              <div className="text-center bg-muted/50 rounded-lg p-3">
                <div className="text-lg font-bold text-primary">{post.stats.matches}</div>
                <div className="text-xs text-muted-foreground">Matchs</div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50 gap-2 overflow-hidden">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-1 flex-shrink-0 ${post.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
            >
              <Heart 
                size={16} 
                className={post.isLiked ? 'fill-current' : ''}
              />
              <span className="text-xs">{post.likes}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCommentInput(showCommentInput === post.id ? null : post.id)}
              className="flex items-center gap-1 text-muted-foreground flex-shrink-0"
            >
              <MessageCircle size={16} />
              <span className="text-xs">{post.comments}</span>
            </Button>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground flex-shrink-0"
            onClick={() => onShare(post)}
          >
            <Share2 size={16} className="mr-1" />
            <span className="text-xs">{post.shares}</span>
          </Button>
        </div>

        {/* Quick Comment Input */}
        {showCommentInput === post.id && (
          <div className="pt-3 border-t border-border/50 overflow-hidden">
            <div className="flex gap-2">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={userProfile?.avatar} />
                <AvatarFallback>{userProfile?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2 min-w-0">
                <Input
                  placeholder="Écrivez un commentaire..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && commentInput.trim()) {
                      onAddComment(post.id, commentInput);
                      setCommentInput("");
                    }
                  }}
                  className="flex-1 min-w-0"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (commentInput.trim()) {
                      onAddComment(post.id, commentInput);
                      setCommentInput("");
                    }
                  }}
                  disabled={!commentInput.trim()}
                  className="flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Afficher les commentaires existants */}
            {postComments[post.id] && postComments[post.id].length > 0 && (
              <div className="mt-3 space-y-2 overflow-hidden">
                {postComments[post.id].slice(0, 3).map((comment: any) => (
                  <div key={comment.id} className="flex gap-2 bg-muted/30 rounded-lg p-2">
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarImage src={comment.user?.avatar} />
                      <AvatarFallback>{comment.user?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{comment.user?.name || 'Utilisateur'}</p>
                      <p className="text-xs text-muted-foreground break-words">{comment.content}</p>
                    </div>
                  </div>
                ))}
                {postComments[post.id].length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    Voir tous les {postComments[post.id].length} commentaires
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};