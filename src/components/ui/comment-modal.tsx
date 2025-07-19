import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Send, Reply, AtSign, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  likes: number;
  isLiked: boolean;
  timestamp: string;
  replies?: Comment[];
  parentId?: string;
  mentions?: string[];
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

export const CommentModal = ({ isOpen, onClose, postId }: CommentModalProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const { toast } = useToast();

  // Mock users for mentions
  const mockUsers = [
    { id: "1", name: "Sophie Martin", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop" },
    { id: "2", name: "Alex Dubois", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
    { id: "3", name: "Marco Rodriguez", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" }
  ];

  const handleLikeComment = (commentId: string, isReply = false, parentId?: string) => {
    if (isReply && parentId) {
      setComments(comments.map(comment => 
        comment.id === parentId 
          ? {
              ...comment,
              replies: comment.replies?.map(reply =>
                reply.id === commentId
                  ? { ...reply, isLiked: !reply.isLiked, likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1 }
                  : reply
              )
            }
          : comment
      ));
    } else {
      setComments(comments.map(comment =>
        comment.id === commentId
          ? { ...comment, isLiked: !comment.isLiked, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 }
          : comment
      ));
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: {
        name: "Vous",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
      },
      content: newComment,
      likes: 0,
      isLiked: false,
      timestamp: "À l'instant",
      mentions: mentionQuery ? [mentionQuery] : undefined
    };

    if (replyingTo) {
      setComments(comments.map(c => 
        c.id === replyingTo 
          ? { ...c, replies: [...(c.replies || []), { ...comment, parentId: replyingTo, id: `${replyingTo}-${Date.now()}` }] }
          : c
      ));
      setReplyingTo(null);
    } else {
      setComments([comment, ...comments]);
    }

    // Clear form
    setNewComment("");
    setMentionQuery("");
    setShowMentions(false);
    
    toast({
      title: "Commentaire ajouté !",
      description: "Votre commentaire a été publié avec succès.",
    });
  };

  const handleMention = (username: string) => {
    setNewComment(newComment + `@${username} `);
    setShowMentions(false);
    setMentionQuery("");
  };

  const handleInputChange = (value: string) => {
    setNewComment(value);
    
    // Check for @ mention
    const lastWord = value.split(' ').pop();
    if (lastWord?.startsWith('@')) {
      setMentionQuery(lastWord.slice(1));
      setShowMentions(true);
    } else {
      setShowMentions(false);
      setMentionQuery("");
    }
  };

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleClose = () => {
    // Clear form on close to prevent pre-filled comments
    setNewComment("");
    setReplyingTo(null);
    setMentionQuery("");
    setShowMentions(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Commentaires
          </DialogTitle>
          <DialogDescription>
            {comments.length} commentaire{comments.length !== 1 ? 's' : ''}
            {replyingTo && " - Réponse en cours"}
          </DialogDescription>
        </DialogHeader>

        {/* Comment input */}
        <div className="border-b pb-4 space-y-2">
          <div className="relative">
            <Input
              placeholder={replyingTo ? "Écrivez votre réponse..." : "Ajoutez un commentaire..."}
              value={newComment}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              className="pr-12"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowMentions(!showMentions)}
              >
                <AtSign className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {replyingTo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Reply className="w-4 h-4" />
              En réponse à un commentaire
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setReplyingTo(null)}
                className="p-0 h-auto text-xs"
              >
                Annuler
              </Button>
            </div>
          )}

          {/* Mentions dropdown */}
          {showMentions && (
            <div className="border rounded-lg p-2 bg-background shadow-lg">
              <div className="text-xs text-muted-foreground mb-2">Mentionner quelqu'un</div>
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => handleMention(user.name)}
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{user.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucun commentaire pour le moment</p>
              <p className="text-sm">Soyez le premier à commenter !</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="space-y-2">
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.user.avatar} />
                    <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.user.name}</span>
                        <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                          comment.isLiked ? 'text-red-500' : ''
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                        {comment.likes || ''}
                      </button>
                      
                      <button
                        onClick={() => setReplyingTo(comment.id)}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Reply className="w-3 h-3" />
                        Répondre
                      </button>
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-4 space-y-2 border-l-2 border-muted pl-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={reply.user.avatar} />
                              <AvatarFallback>{reply.user.name[0]}</AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="bg-muted/50 rounded-lg p-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-xs">{reply.user.name}</span>
                                  <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                                </div>
                                <p className="text-xs">{reply.content}</p>
                              </div>
                              
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <button
                                  onClick={() => handleLikeComment(reply.id, true, comment.id)}
                                  className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                                    reply.isLiked ? 'text-red-500' : ''
                                  }`}
                                >
                                  <Heart className={`w-3 h-3 ${reply.isLiked ? 'fill-current' : ''}`} />
                                  {reply.likes || ''}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};