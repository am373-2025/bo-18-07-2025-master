import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CommentModal } from "@/components/ui/comment-modal";
import { ShareModal } from "@/components/ui/share-modal";
import { PostActionsMenu } from "@/components/ui/post-actions-menu";
import { CreatePollModal } from "@/components/ui/create-poll-modal";
import { MediaUploadModal } from "@/components/ui/media-upload-modal";
import { Heart, MessageCircle, Plus, Image, Video, BarChart3, Trophy, Users, Bookmark } from "lucide-react";

// Données de test pour le feed
const feedData = [
  {
    id: "1",
    user: {
      name: "Alex Martin",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      verified: true
    },
    content: "Mbappé mérite vraiment le Ballon d'Or cette année ! Ses performances au Real sont exceptionnelles 🔥⚽",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    likes: 127,
    comments: 23,
    shares: 8,
    timestamp: "il y a 2h",
    type: "post",
    isLiked: false,
    likedBy: [],
    isFavorite: false,
    isReported: false
  },
  {
    id: "2",
    user: {
      name: "Sophie Durand",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop",
      verified: false
    },
    content: "Sondage : Qui selon vous mérite le top 3 cette année ?",
    poll: {
      question: "Votre top 3 Ballon d'Or 2025 ?",
      options: [
        { text: "Mbappé, Haaland, Bellingham", votes: 45, voted: false },
        { text: "Haaland, Mbappé, Pedri", votes: 32, voted: false },
        { text: "Bellingham, Mbappé, Haaland", votes: 23, voted: false }
      ]
    },
    likes: 89,
    comments: 34,
    shares: 12,
    timestamp: "il y a 4h",
    type: "poll",
    isLiked: true,
    likedBy: ["currentUser"],
    isFavorite: false,
    isReported: false
  },
  {
    id: "3",
    user: {
      name: "Marco Rodriguez",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      verified: true
    },
    content: "Stats incroyables de Haaland cette saison ! 🤯",
    stats: {
      goals: 42,
      assists: 15,
      matches: 38
    },
    likes: 203,
    comments: 56,
    shares: 28,
    timestamp: "il y a 6h",
    type: "stats",
    isLiked: false,
    likedBy: [],
    isFavorite: true,
    isReported: false
  }
];

export default function Club() {
  const [posts, setPosts] = useState(feedData);
  const [newPost, setNewPost] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [currentUserId] = useState("currentUser");
  const { toast } = useToast();

  const handleLike = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    const hasLiked = post?.likedBy?.includes(currentUserId) || false;
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newLikedBy = hasLiked 
          ? post.likedBy.filter((id: string) => id !== currentUserId)
          : [...(post.likedBy || []), currentUserId];
        
        return {
          ...post,
          isLiked: !hasLiked,
          likes: hasLiked ? post.likes - 1 : post.likes + 1,
          likedBy: newLikedBy
        };
      }
      return post;
    }));
    
    toast({
      title: !hasLiked ? "Post aimé ❤️" : "Like retiré",
      description: !hasLiked ? "Vous avez aimé cette publication" : "Vous avez retiré votre like"
    });
  };

  const handleComment = (post: any) => {
    setSelectedPost(post);
    setShowComments(true);
  };

  const handleShare = (post: any) => {
    setSelectedPost({
      title: `Publication de ${post.user.name}`,
      description: post.content,
      url: `https://ballondor2025.com/post/${post.id}`
    });
    setShowShare(true);
    
    // Increment share count
    setPosts(posts.map(p => 
      p.id === post.id 
        ? { ...p, shares: p.shares + 1 }
        : p
    ));
  };

  const handleVotePoll = (postId: string, optionIndex: number) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId && post.poll) {
        const currentVotedIndex = post.poll.options.findIndex((opt: any) => opt.voted);
        
        // If clicking on the same option that was already voted, do nothing
        if (currentVotedIndex === optionIndex) {
          return post;
        }
        
        const updatedOptions = post.poll.options.map((option: any, index: number) => {
          if (currentVotedIndex !== -1) {
            // Remove previous vote
            if (index === currentVotedIndex) {
              return { ...option, votes: option.votes - 1, voted: false };
            }
            // Add new vote
            if (index === optionIndex) {
              return { ...option, votes: option.votes + 1, voted: true };
            }
          } else {
            // First vote
            if (index === optionIndex) {
              return { ...option, votes: option.votes + 1, voted: true };
            }
          }
          return option;
        });
        
        return {
          ...post,
          poll: {
            ...post.poll,
            options: updatedOptions
          }
        } as any;
      }
      return post;
    }));

    toast({
      title: "Vote enregistré !",
      description: "Votre vote a été pris en compte dans le sondage."
    });
  };

  const handleCreatePost = () => {
    if (newPost.trim()) {
      const post: any = {
        id: Date.now().toString(),
        user: {
          name: "Vous",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
          verified: false
        },
        content: newPost,
        likes: 0,
        comments: 0,
        shares: 0,
        timestamp: "maintenant",
        type: "post",
        isLiked: false,
        likedBy: [],
        isFavorite: false,
        isReported: false
      };
      
      setPosts([post, ...posts]);
      setNewPost("");
      setShowCreatePost(false);
      
      toast({
        title: "Publication créée !",
        description: "Votre post a été publié avec succès."
      });
    }
  };

  const handleCreatePoll = (pollData: { question: string; options: string[] }) => {
    const post = {
      id: Date.now().toString(),
      user: {
        name: "Vous",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
        verified: false
      },
      content: "",
      poll: {
        question: pollData.question,
        options: pollData.options.map(option => ({ text: option, votes: 0, voted: false }))
      },
      likes: 0,
      comments: 0,
      shares: 0,
      timestamp: "maintenant",
      type: "poll",
      isLiked: false,
      likedBy: [],
      isFavorite: false,
      isReported: false
    } as any;
    
    setPosts([post, ...posts]);
    toast({
      title: "Sondage créé !",
      description: "Votre sondage a été publié avec succès."
    });
  };

  const handleMediaUpload = (file: File, mediaType: 'image' | 'video') => {
    // Créer une URL temporaire pour prévisualiser le fichier
    const mediaUrl = URL.createObjectURL(file);
    
    const postData = {
      id: Date.now().toString(),
      user: {
        name: "Vous",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
        verified: false
      },
        content: newPost || "",
        likes: 0,
        comments: 0,
        shares: 0,
        timestamp: "maintenant",
        type: "post",
        isLiked: false,
        likedBy: [],
        isFavorite: false,
        isReported: false
    };

    const post = mediaType === 'image' 
      ? { ...postData, image: mediaUrl }
      : { ...postData, video: mediaUrl };
    
    setPosts([post as any, ...posts]);
    setNewPost("");
    setShowCreatePost(false);
    
    toast({
      title: "Média publié !",
      description: `Votre ${mediaType === 'image' ? 'photo' : 'vidéo'} a été publié avec succès.`
    });
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setNewPost(post.content);
    setShowCreatePost(true);
  };

  const updatePost = () => {
    if (editingPost && newPost.trim()) {
      setPosts(posts.map(p => 
        p.id === editingPost.id 
          ? { ...p, content: newPost }
          : p
      ));
      setEditingPost(null);
      setNewPost("");
      setShowCreatePost(false);
      toast({
        title: "Post modifié !",
        description: "Votre publication a été mise à jour."
      });
    }
  };

  const handleFavoritePost = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isFavorite: !post.isFavorite }
        : post
    ));
    
    const post = posts.find(p => p.id === postId);
    toast({
      title: post?.isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
      description: post?.isFavorite ? "Post retiré de vos favoris" : "Post ajouté à vos favoris"
    });
  };

  const handleReportPost = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isReported: true }
        : post
    ));
    
    toast({
      title: "Post signalé",
      description: "Ce post a été signalé aux modérateurs."
    });
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
    setEditingPost(null);
    setNewPost("");
    setShowCreatePost(false);
    toast({
      title: "Post supprimé !",
      description: "Votre publication a été supprimée avec succès."
    });
  };

  const PostCard = ({ post }: { post: any }) => (
    <Card className="card-golden animate-slide-up">
      <CardContent className="p-0">
        {/* Header du post */}
        <div className="p-4 pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.user.avatar} alt={post.user.name} />
              <AvatarFallback>{post.user.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{post.user.name}</h3>
                {post.user.verified && (
                  <Badge className="bg-primary/10 text-primary text-xs px-1 py-0">
                    ✓
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{post.timestamp}</p>
            </div>
            <PostActionsMenu
              postId={post.id}
              isOwnPost={post.user.name === "Vous"}
              onEdit={() => handleEditPost(post)}
              onDelete={() => handleDeletePost(post.id)}
              onFavorite={() => handleFavoritePost(post.id)}
              onReport={() => handleReportPost(post.id)}
              onShare={() => handleShare(post)}
              isFavorited={post.isFavorite}
              isReported={post.isReported}
            />
          </div>
        </div>

        {/* Contenu du post */}
        <div className="px-4 pb-3">
          <p className="text-sm leading-relaxed">{post.content}</p>
          
          {/* Image */}
          {post.image && (
            <div className="mt-3 rounded-lg overflow-hidden">
              <img 
                src={post.image} 
                alt="Post content" 
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Vidéo */}
          {post.video && (
            <div className="mt-3 rounded-lg overflow-hidden">
              <video 
                src={post.video} 
                controls
                className="w-full h-48 object-cover"
              >
                Votre navigateur ne supporte pas les vidéos.
              </video>
            </div>
          )}

          {/* Sondage */}
          {post.poll && (
            <div className="mt-3 space-y-3">
              <h4 className="font-semibold text-sm">{post.poll.question}</h4>
              <div className="space-y-2">
                {post.poll.options.map((option: any, index: number) => {
                  const total = post.poll.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);
                  const percentage = total > 0 ? (option.votes / total) * 100 : 0;
                  const hasVoted = post.poll.options.some((opt: any) => opt.voted);
                  
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className={`w-full h-auto p-3 justify-between relative overflow-hidden ${
                        option.voted ? 'bg-primary/10 border-primary' : 'hover:bg-primary/5'
                      }`}
                       onClick={() => handleVotePoll(post.id, index)}
                    >
                      <div 
                        className="absolute left-0 top-0 h-full bg-primary/20 transition-all duration-500"
                        style={{ width: hasVoted ? `${percentage}%` : '0%' }}
                      />
                      <span className="text-sm relative z-10">{option.text}</span>
                      <div className="flex items-center gap-2 relative z-10">
                        {hasVoted && (
                          <span className="text-xs text-muted-foreground">
                            {percentage.toFixed(0)}%
                          </span>
                        )}
                        <span className="text-xs font-medium">{option.votes}</span>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stats */}
          {post.stats && (
            <div className="mt-3 grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="font-bold text-lg text-primary">{post.stats.goals}</div>
                <div className="text-xs text-muted-foreground">Buts</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-primary">{post.stats.assists}</div>
                <div className="text-xs text-muted-foreground">Passes</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-primary">{post.stats.matches}</div>
                <div className="text-xs text-muted-foreground">Matchs</div>
              </div>
            </div>
          )}
        </div>

          {/* Actions */}
        <div className="px-4 py-3 border-t border-border/50">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 transition-colors ${
                post.isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
              }`}
              onClick={() => handleLike(post.id)}
            >
              <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs">{post.likes}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2 text-muted-foreground hover:text-blue-500"
              onClick={() => handleComment(post)}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{post.comments}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex items-center gap-2 transition-colors ${
                post.isFavorite ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'
              }`}
              onClick={() => handleFavoritePost(post.id)}
            >
              <Heart className={`w-4 h-4 ${post.isFavorite ? 'fill-current' : ''}`} />
              <span className="text-xs">Favoris</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
        <div className="p-4 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-3">
            <Users className="w-8 h-8 text-primary animate-float" />
            <h1 className="text-2xl font-bold text-gradient-gold">Club</h1>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Partagez votre passion avec la communauté
          </p>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4 animate-fade-in">
        {/* Bouton de création */}
        <Card className="card-golden">
          <CardContent className="p-4">
            <Button
              className="w-full btn-golden-outline justify-start"
              onClick={() => setShowCreatePost(!showCreatePost)}
            >
              <Plus className="w-5 h-5 mr-3" />
              Partager votre avis sur le Ballon d'Or...
            </Button>
          </CardContent>
        </Card>

        {/* Interface de création de post */}
        {showCreatePost && (
          <Card className="card-golden animate-scale-in">
            <CardHeader className="pb-3">
              <h3 className="font-semibold text-gradient-gold">Créer une publication</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Partagez votre avis, vos prédictions, vos analyses..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[100px] border-border/50"
              />
              
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="flex items-center gap-2" onClick={() => setShowMediaModal(true)}>
                  <Image className="w-4 h-4" />
                  Photo/Vidéo
                </Button>
                <Button size="sm" variant="outline" className="flex items-center gap-2" onClick={() => setShowPollModal(true)}>
                  <BarChart3 className="w-4 h-4" />
                  Sondage
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowCreatePost(false);
                    setEditingPost(null);
                    setNewPost("");
                  }}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1 btn-golden"
                  onClick={editingPost ? updatePost : handleCreatePost}
                  disabled={!newPost.trim()}
                >
                  {editingPost ? "Mettre à jour" : "Publier"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feed des publications */}
        <div className="space-y-4">
          {posts.map((post, index) => (
            <div
              key={post.id}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <PostCard post={post} />
            </div>
          ))}
        </div>

        {/* Call to action */}
        <Card className="card-golden">
          <CardContent className="p-4 text-center space-y-3">
            <Trophy className="w-12 h-12 text-primary mx-auto animate-glow" />
            <h3 className="font-bold text-gradient-gold">
              Rejoignez la conversation !
            </h3>
            <p className="text-sm text-muted-foreground">
              Partagez vos analyses, débattez avec d'autres fans et suivez l'actualité du Ballon d'Or
            </p>
            <Button className="btn-golden w-full" onClick={() => {
              toast({
                title: "🎉 Invitation d'amis",
                description: "Lien de partage copié ! Invitez vos amis à rejoindre la communauté"
              });
            }}>
              Inviter des amis
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Modales */}
      <CommentModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        postId={selectedPost?.id || ""}
      />

      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        content={selectedPost || { title: "", description: "", url: "" }}
      />

      <CreatePollModal
        isOpen={showPollModal}
        onClose={() => setShowPollModal(false)}
        onCreatePoll={handleCreatePoll}
      />

      <MediaUploadModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onUpload={handleMediaUpload}
      />
    </div>
  );
}