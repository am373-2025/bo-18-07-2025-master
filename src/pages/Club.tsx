import React from "react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CommentModal } from "@/components/ui/comment-modal";
import { ShareModal } from "@/components/ui/share-modal";
import { PostActionsMenu } from "@/components/ui/post-actions-menu";
import { LoginModal } from "@/components/ui/login-modal";
import { CreatePollModal } from "@/components/ui/create-poll-modal";
import { MediaUploadModal } from "@/components/ui/media-upload-modal";
import { supabase } from "@/lib/supabaseClient";
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
  const { user, isAuthenticated } = useAuth();
  const { profile, updateProfile } = useProfile();
  const [posts, setPosts] = useState(feedData);
  const [userPosts, setUserPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const currentUserId = user?.id || "currentUser";
  const [postsInitialized, setPostsInitialized] = useState(false);
  const { toast } = useToast();

  // Charger les posts utilisateur depuis Supabase
  React.useEffect(() => {
    const loadUserPosts = async () => {
      if (!user || postsInitialized) return;
      
      setLoading(true);
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('user_posts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          setUserPosts(data || []);
        } else {
          // localStorage fallback
          const stored = JSON.parse(localStorage.getItem('userPosts') || '[]');
          const userStoredPosts = stored.filter((post: any) => post.user_id === user.id);
          setUserPosts(userStoredPosts);
        }
      } catch (error) {
        console.error('Error loading user posts:', error);
      } finally {
        setLoading(false);
        setPostsInitialized(true);
      }
    };
    
    if (isAuthenticated && user) {
      loadUserPosts();
    }
  }, [user, isAuthenticated, postsInitialized]);

  React.useEffect(() => {
    if (userPosts.length > 0 && postsInitialized) {
      const supabasePosts = userPosts.map(post => ({
        id: post.id,
        user: {
          name: profile?.name || "Vous",
          avatar: profile?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
          verified: false
        },
        content: post.content,
        image: post.image_url,
        video: post.video_url,
        likes: post.likes || 0,
        comments: post.comments_count || 0,
        shares: post.shares || 0,
        timestamp: new Date(post.created_at).toLocaleString('fr-FR'),
        type: post.post_type || "post",
        isLiked: false,
        likedBy: [],
        isFavorite: false,
        isReported: false
      }));
      setPosts([...supabasePosts, ...feedData]);
    }
  }, [userPosts, profile]);

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour effectuer cette action.",
        variant: "destructive"
      });
      return;
    }
    action();
  };

  const handleLike = (postId: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

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

  const handleCreatePost = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (newPost.trim()) {
      setLoading(true);
      try {
        let data = null;
        
        if (supabase) {
          // Sauvegarder en Supabase
          const { data: insertedData, error } = await supabase
            .from('user_posts')
            .insert([{
              user_id: currentUserId,
              content: newPost,
              post_type: "text",
              likes: 0,
              comments_count: 0,
              shares: 0
            }])
            .select()
            .single();
          
          if (error) throw error;
          data = insertedData;
        } else {
          // localStorage fallback
          const stored = JSON.parse(localStorage.getItem('userPosts') || '[]');
          data = {
            id: crypto.randomUUID(),
            user_id: currentUserId,
            content: newPost,
            post_type: "text",
            likes: 0,
            comments_count: 0,
            shares: 0,
            created_at: new Date().toISOString()
          };
          stored.push(data);
          localStorage.setItem('userPosts', JSON.stringify(stored));
        }

        // Mettre à jour les stats du profil
        if (profile) {
          await updateProfile({
            stats: {
              ...profile.stats,
              posts: profile.stats.posts + 1
            }
          });
        }

        const post: any = {
          id: data?.id || Date.now().toString(),
          user: {
            name: profile?.name || "Vous",
            avatar: profile?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
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
        setUserPosts([data, ...userPosts]);
        setNewPost("");
        setShowCreatePost(false);
        
        toast({
          title: "Publication créée !",
          description: "Votre post a été publié avec succès et sauvegardé."
        });
      } catch (error) {
        console.error('Error creating post:', error);
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder votre post. Vérifiez votre connexion.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreatePoll = async (pollData: { question: string; options: string[] }) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    try {
      let data = null;
      
      if (supabase) {
        // Sauvegarder en Supabase
        const { data: insertedData, error } = await supabase
          .from('user_posts')
          .insert([{
            user_id: currentUserId,
            content: pollData.question,
            post_type: "poll",
            poll_data: {
              question: pollData.question,
              options: pollData.options.map(option => ({ text: option, votes: 0, voted: false }))
            },
            likes: 0,
            comments_count: 0,
            shares: 0
          }])
          .select()
          .single();
        
        if (error) throw error;
        data = insertedData;
      } else {
        // localStorage fallback
        const stored = JSON.parse(localStorage.getItem('userPosts') || '[]');
        data = {
          id: crypto.randomUUID(),
          user_id: currentUserId,
          content: pollData.question,
          post_type: "poll",
          poll_data: {
            question: pollData.question,
            options: pollData.options.map(option => ({ text: option, votes: 0, voted: false }))
          },
          likes: 0,
          comments_count: 0,
          shares: 0,
          created_at: new Date().toISOString()
        };
        stored.push(data);
        localStorage.setItem('userPosts', JSON.stringify(stored));
      }

      const post = {
        id: data?.id || Date.now().toString(),
        user: {
          name: profile?.name || "Vous",
          avatar: profile?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
          verified: false
        },
        content: "",
        poll: data?.poll_data,
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
      setUserPosts([data, ...userPosts]);
      toast({
        title: "Sondage créé !",
        description: "Votre sondage a été publié avec succès et sauvegardé."
      });
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder votre sondage.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = async (file: File, mediaType: 'image' | 'video') => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // Créer une URL temporaire pour prévisualiser le fichier
    const mediaUrl = URL.createObjectURL(file);

    setLoading(true);
    try {
      let data = null;
      
      if (supabase) {
        // Sauvegarder en Supabase
        const insertData = {
          user_id: currentUserId,
          content: newPost || "",
          post_type: "text",
          likes: 0,
          comments_count: 0,
          shares: 0,
          ...(mediaType === 'image' ? { image_url: mediaUrl } : { video_url: mediaUrl })
        };
        
        const { data: insertedData, error } = await supabase
          .from('user_posts')
          .insert([insertData])
          .select()
          .single();
        
        if (error) throw error;
        data = insertedData;
      } else {
        // localStorage fallback
        const stored = JSON.parse(localStorage.getItem('userPosts') || '[]');
        data = {
          id: crypto.randomUUID(),
          user_id: currentUserId,
          content: newPost || "",
          post_type: "text",
          likes: 0,
          comments_count: 0,
          shares: 0,
          created_at: new Date().toISOString(),
          ...(mediaType === 'image' ? { image_url: mediaUrl } : { video_url: mediaUrl })
        };
        stored.push(data);
        localStorage.setItem('userPosts', JSON.stringify(stored));
      }

      const postData = {
        id: data?.id || Date.now().toString(),
        user: {
          name: profile?.name || "Vous",
          avatar: profile?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
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
      setUserPosts([data, ...userPosts]);
      setNewPost("");
      setShowCreatePost(false);
      
      toast({
        title: "Média publié !",
        description: `Votre ${mediaType === 'image' ? 'photo' : 'vidéo'} a été publié avec succès et sauvegardé.`
      });
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder votre média.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setNewPost(post.content);
    setShowCreatePost(true);
  };

  const handleUpdatePost = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (editingPost && newPost.trim()) {
      setLoading(true);
      try {
        if (supabase) {
          // Mettre à jour en Supabase
          const { error } = await supabase
            .from('user_posts')
            .update({
              content: newPost,
              updated_at: new Date().toISOString()
            })
            .eq('id', editingPost.id);
          
          if (error) throw error;
        } else {
          // localStorage fallback
          const stored = JSON.parse(localStorage.getItem('userPosts') || '[]');
          const updated = stored.map((post: any) => 
            post.id === editingPost.id 
              ? { ...post, content: newPost, updated_at: new Date().toISOString() }
              : post
          );
          localStorage.setItem('userPosts', JSON.stringify(updated));
        }

        setPosts(posts.map(p => 
          p.id === editingPost.id 
            ? { ...p, content: newPost }
            : p
        ));
        
        setUserPosts(userPosts.map(p => 
          p.id === editingPost.id 
            ? { ...p, content: newPost, updated_at: new Date().toISOString() }
            : p
        ));
        
        setEditingPost(null);
        setNewPost("");
        setShowCreatePost(false);
        toast({
          title: "Post modifié !",
          description: "Votre publication a été mise à jour et sauvegardée."
        });
      } catch (error) {
        console.error('Error updating post:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour votre post.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFavoritePost = async (postId: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    try {
      const post = posts.find(p => p.id === postId);
    }
  }
}