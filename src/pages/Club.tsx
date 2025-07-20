import React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CommentModal } from "@/components/ui/comment-modal";
import { ShareModal } from "@/components/ui/share-modal";
import { PostActionsMenu } from "@/components/ui/post-actions-menu";
import { LoginModal } from "@/components/ui/login-modal";
import { CreatePollModal } from "@/components/ui/create-poll-modal";
import { MediaUploadModal } from "@/components/ui/media-upload-modal";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  MessageCircle, 
  Plus, 
  Image, 
  Video, 
  BarChart3, 
  Trophy, 
  Users, 
  Bookmark, 
  Share2,
  Edit3,
  Play,
  Send
} from "lucide-react";

// Interface pour les posts
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
  likedBy: string[];
  isFavorite: boolean;
  isReported: boolean;
  canEdit?: boolean;
}

interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  likes: number;
  created_at: string;
  user?: {
    name: string;
    avatar: string;
  };
}

// Données de test pour le feed initial
const initialFeedData: Post[] = [
  {
    id: "demo-1",
    user: {
      id: "demo-user-1",
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
    id: "demo-2",
    user: {
      id: "demo-user-2",
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
    isLiked: false,
    likedBy: [],
    isFavorite: false,
    isReported: false
  }
];

export default function Club() {
  const { user, isAuthenticated } = useAuth();
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>(initialFeedData);
  const [userPosts, setUserPosts] = useState<any[]>([]);
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<'image' | 'video' | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [showCommentInput, setShowCommentInput] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<{ [key: string]: Comment[] }>({});
  const currentUserId = user?.id || "guest-user";
  const { toast } = useToast();

  // Charger les posts utilisateur depuis Supabase
  useEffect(() => {
    const loadUserPosts = async () => {
      if (!user) return;
      
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
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger vos publications",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && user) {
      loadUserPosts();
    }
  }, [user, isAuthenticated]);

  // Charger les likes et commentaires pour chaque post
  useEffect(() => {
    const loadPostInteractions = async () => {
      if (!supabase) return;

      try {
        // Charger les likes
        const { data: likesData } = await supabase
          .from('user_post_likes')
          .select('post_id, user_id');

        // Charger les commentaires avec profils utilisateur
        const { data: commentsData } = await supabase
          .from('user_post_comments')
          .select(`
            id,
            user_id,
            post_id,
            content,
            likes,
            created_at,
            profiles(name, avatar)
          `)
          .order('created_at', { ascending: true });

        // Organiser les données
        if (likesData) {
          const likesByPost: { [key: string]: string[] } = {};
          likesData.forEach(like => {
            if (!likesByPost[like.post_id]) likesByPost[like.post_id] = [];
            likesByPost[like.post_id].push(like.user_id);
          });

          // Mettre à jour les posts avec les likes
          setPosts(prevPosts => prevPosts.map(post => ({
            ...post,
            likedBy: likesByPost[post.id] || [],
            isLiked: likesByPost[post.id]?.includes(currentUserId) || false,
            likes: (likesByPost[post.id] || []).length
          })));
        }

        if (commentsData) {
          const commentsByPost: { [key: string]: Comment[] } = {};
          commentsData.forEach(comment => {
            if (!commentsByPost[comment.post_id]) commentsByPost[comment.post_id] = [];
            commentsByPost[comment.post_id].push({
              ...comment,
              user: comment.profiles ? {
                name: comment.profiles.name,
                avatar: comment.profiles.avatar
              } : undefined
            });
          });
          setPostComments(commentsByPost);

          // Mettre à jour le nombre de commentaires
          setPosts(prevPosts => prevPosts.map(post => ({
            ...post,
            comments: (commentsByPost[post.id] || []).length
          })));
        }
      } catch (error) {
        console.error('Error loading interactions:', error);
      }
    };

    loadPostInteractions();
  }, [currentUserId]);

  // Convertir les posts Supabase en format d'affichage
  useEffect(() => {
    if (userPosts.length > 0) {
      const convertedPosts = userPosts.map(post => ({
        id: post.id,
        user: {
          id: currentUserId,
          name: profile?.name || "Vous",
          avatar: profile?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
          verified: false
        },
        content: post.content || "",
        image: post.image_url,
        video: post.video_url,
        poll: post.poll_data,
        likes: post.likes || 0,
        comments: post.comments_count || 0,
        shares: post.shares || 0,
        timestamp: new Date(post.created_at).toLocaleString('fr-FR'),
        type: post.post_type || "post",
        isLiked: false,
        likedBy: [],
        isFavorite: false,
        isReported: false,
        canEdit: true
      }));
      
      setPosts([...convertedPosts, ...initialFeedData]);
    }
  }, [userPosts, profile, currentUserId]);

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

  const handleLike = async (postId: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const post = posts.find(p => p.id === postId);
    const hasLiked = post?.likedBy?.includes(currentUserId) || false;
    
    try {
      if (supabase) {
        if (hasLiked) {
          // Retirer le like
          await supabase
            .from('user_post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', currentUserId);
        } else {
          // Ajouter le like
          await supabase
            .from('user_post_likes')
            .insert([{ post_id: postId, user_id: currentUserId }]);
        }

        // Mettre à jour le compteur dans user_posts si c'est un post utilisateur
        const userPost = userPosts.find(p => p.id === postId);
        if (userPost) {
          const newLikes = hasLiked ? (userPost.likes || 1) - 1 : (userPost.likes || 0) + 1;
          await supabase
            .from('user_posts')
            .update({ likes: newLikes })
            .eq('id', postId);
        }
      }

      // Mettre à jour l'état local
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
    } catch (error) {
      console.error('Error handling like:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder votre like",
        variant: "destructive"
      });
    }
  };

  const handleComment = (post: any) => {
    setSelectedPost(post);
    setShowComments(true);
  };

  const handleAddComment = async (postId: string, content: string) => {
    if (!isAuthenticated || !content.trim()) return;

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('user_post_comments')
          .insert([{
            user_id: currentUserId,
            post_id: postId,
            content: content.trim()
          }])
          .select(`
            id,
            user_id,
            post_id,
            content,
            likes,
            created_at,
            profiles(name, avatar)
          `)
          .single();

        if (error) throw error;

        const newComment: Comment = {
          ...data,
          user: data.profiles ? {
            name: data.profiles.name,
            avatar: data.profiles.avatar
          } : {
            name: profile?.name || "Vous",
            avatar: profile?.avatar || ""
          }
        };

        // Mettre à jour les commentaires locaux
        setPostComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), newComment]
        }));

        // Mettre à jour le compteur dans user_posts
        const userPost = userPosts.find(p => p.id === postId);
        if (userPost) {
          const newCount = (userPost.comments_count || 0) + 1;
          await supabase
            .from('user_posts')
            .update({ comments_count: newCount })
            .eq('id', postId);
        }

        // Mettre à jour l'état des posts
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, comments: post.comments + 1 }
            : post
        ));

        toast({
          title: "Commentaire ajouté !",
          description: "Votre commentaire a été publié avec succès."
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Erreur",
        description: "Impossible de publier votre commentaire",
        variant: "destructive"
      });
    }
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

  const handleVotePoll = async (postId: string, optionIndex: number) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId && post.poll) {
        const currentVotedIndex = post.poll.options.findIndex((opt: any) => opt.voted);
        
        if (currentVotedIndex === optionIndex) {
          return post;
        }
        
        const updatedOptions = post.poll.options.map((option: any, index: number) => {
          if (currentVotedIndex !== -1) {
            if (index === currentVotedIndex) {
              return { ...option, votes: option.votes - 1, voted: false };
            }
            if (index === optionIndex) {
              return { ...option, votes: option.votes + 1, voted: true };
            }
          } else {
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

    if (!newPost.trim() && !selectedFile) {
      toast({
        title: "Contenu requis",
        description: "Veuillez ajouter du texte ou un média",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      let mediaUrl = null;
      
      // Gérer l'upload de fichier
      if (selectedFile) {
        if (selectedFile.size > 10 * 1024 * 1024) { // 10MB max
          throw new Error("Le fichier est trop volumineux (max 10MB)");
        }
        
        // Créer une URL blob persistante
        mediaUrl = URL.createObjectURL(selectedFile);
        
        // Stocker la référence pour éviter la garbage collection
        if (!window.mediaBlobs) {
          window.mediaBlobs = new Map();
        }
        window.mediaBlobs.set(mediaUrl, selectedFile);
      }

      let data = null;
      
      if (supabase) {
        const insertData: any = {
          user_id: currentUserId,
          content: newPost.trim(),
          post_type: selectedFileType || 'text',
          likes: 0,
          comments_count: 0,
          shares: 0
        };

        if (selectedFileType === 'image' && mediaUrl) {
          insertData.image_url = mediaUrl;
        } else if (selectedFileType === 'video' && mediaUrl) {
          insertData.video_url = mediaUrl;
        }
        
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
          content: newPost.trim(),
          post_type: selectedFileType || "text",
          likes: 0,
          comments_count: 0,
          shares: 0,
          created_at: new Date().toISOString(),
          image_url: selectedFileType === 'image' ? mediaUrl : null,
          video_url: selectedFileType === 'video' ? mediaUrl : null
        };
        stored.push(data);
        localStorage.setItem('userPosts', JSON.stringify(stored));
      }

      // Mettre à jour les stats du profil
      if (profile && profile.stats) {
        await updateProfile({
          stats: {
            ...profile.stats,
            posts: profile.stats.posts + 1
          }
        });
      }

      const newPostData: Post = {
        id: data?.id || Date.now().toString(),
        user: {
          id: currentUserId,
          name: profile?.name || "Vous",
          avatar: profile?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
          verified: false
        },
        content: newPost.trim(),
        image: selectedFileType === 'image' ? mediaUrl : undefined,
        video: selectedFileType === 'video' ? mediaUrl : undefined,
        likes: 0,
        comments: 0,
        shares: 0,
        timestamp: "maintenant",
        type: "post",
        isLiked: false,
        likedBy: [],
        isFavorite: false,
        isReported: false,
        canEdit: true
      };
      
      setPosts([newPostData, ...posts]);
      setUserPosts([data, ...userPosts]);
      
      // Reset form
      setNewPost("");
      setSelectedFile(null);
      setSelectedFileType(null);
      setShowCreatePost(false);
      setEditingPost(null);
      
      toast({
        title: "Publication créée !",
        description: `Votre ${selectedFileType === 'video' ? 'vidéo' : selectedFileType === 'image' ? 'photo' : 'post'} a été publié avec succès.`
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de publier votre contenu",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!isAuthenticated || !editingPost) {
      return;
    }

    if (!newPost.trim() && !selectedFile) {
      toast({
        title: "Contenu requis",
        description: "Veuillez ajouter du texte ou un média",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      let mediaUrl = editingPost.image || editingPost.video;
      
      // Gérer le nouveau fichier
      if (selectedFile) {
        if (selectedFile.size > 10 * 1024 * 1024) {
          throw new Error("Le fichier est trop volumineux (max 10MB)");
        }
        
        // Créer une nouvelle URL blob
        mediaUrl = URL.createObjectURL(selectedFile);
        
        // Stocker la référence
        if (!window.mediaBlobs) {
          window.mediaBlobs = new Map();
        }
        window.mediaBlobs.set(mediaUrl, selectedFile);
      }

      if (supabase) {
        const updateData: any = {
          content: newPost.trim(),
          updated_at: new Date().toISOString()
        };

        if (selectedFileType === 'image' && mediaUrl) {
          updateData.image_url = mediaUrl;
          updateData.video_url = null;
        } else if (selectedFileType === 'video' && mediaUrl) {
          updateData.video_url = mediaUrl;
          updateData.image_url = null;
        }
        
        const { error } = await supabase
          .from('user_posts')
          .update(updateData)
          .eq('id', editingPost.id);
        
        if (error) throw error;
      } else {
        // localStorage fallback
        const stored = JSON.parse(localStorage.getItem('userPosts') || '[]');
        const updated = stored.map((post: any) => 
          post.id === editingPost.id 
            ? { 
                ...post, 
                content: newPost.trim(), 
                updated_at: new Date().toISOString(),
                image_url: selectedFileType === 'image' ? mediaUrl : post.image_url,
                video_url: selectedFileType === 'video' ? mediaUrl : post.video_url
              }
            : post
        );
        localStorage.setItem('userPosts', JSON.stringify(updated));
      }

      // Mettre à jour l'état local
      setPosts(posts.map(p => 
        p.id === editingPost.id 
          ? { 
              ...p, 
              content: newPost.trim(),
              image: selectedFileType === 'image' ? mediaUrl : p.image,
              video: selectedFileType === 'video' ? mediaUrl : p.video
            }
          : p
      ));
      
      setUserPosts(userPosts.map(p => 
        p.id === editingPost.id 
          ? { 
              ...p, 
              content: newPost.trim(), 
              updated_at: new Date().toISOString(),
              image_url: selectedFileType === 'image' ? mediaUrl : p.image_url,
              video_url: selectedFileType === 'video' ? mediaUrl : p.video_url
            }
          : p
      ));
      
      // Reset form
      setEditingPost(null);
      setNewPost("");
      setSelectedFile(null);
      setSelectedFileType(null);
      setShowCreatePost(false);
      
      toast({
        title: "Post modifié !",
        description: "Votre publication a été mise à jour avec succès."
      });
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de modifier votre post",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setNewPost(post.content);
    setShowCreatePost(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (!isAuthenticated) return;

    try {
      if (supabase) {
        await supabase
          .from('user_posts')
          .delete()
          .eq('id', postId);
      } else {
        const stored = JSON.parse(localStorage.getItem('userPosts') || '[]');
        const updated = stored.filter((post: any) => post.id !== postId);
        localStorage.setItem('userPosts', JSON.stringify(updated));
      }

      setPosts(posts.filter(p => p.id !== postId));
      setUserPosts(userPosts.filter(p => p.id !== postId));
      
      toast({
        title: "Post supprimé",
        description: "Votre publication a été supprimée avec succès."
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le post",
        variant: "destructive"
      });
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

      const post: Post = {
        id: data?.id || Date.now().toString(),
        user: {
          id: currentUserId,
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
        isReported: false,
        canEdit: true
      };
      
      setPosts([post, ...posts]);
      setUserPosts([data, ...userPosts]);
      
      toast({
        title: "Sondage créé !",
        description: "Votre sondage a été publié avec succès."
      });
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le sondage",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = (file: File, mediaType: 'image' | 'video') => {
    if (file.size > 10 * 1024 * 1024) { // 10MB max
      toast({
        title: "Fichier trop volumineux",
        description: "Le fichier ne doit pas dépasser 10MB",
        variant: "destructive"
      });
      return;
    }

    // Créer une URL blob et la stocker globalement pour éviter qu'elle expire
    const blobUrl = URL.createObjectURL(file);
    
    // Stocker la référence pour éviter la garbage collection
    if (!window.mediaBlobs) {
      window.mediaBlobs = new Map();
    }
    window.mediaBlobs.set(blobUrl, file);

    setSelectedFile(file);
    setSelectedFileType(mediaType);
    setShowMediaModal(false);
    
    toast({
      title: `${mediaType === 'image' ? 'Photo' : 'Vidéo'} sélectionnée`,
      description: "Ajoutez du texte et publiez votre contenu"
    });
  };

  const handleUserClick = (userId: string) => {
    if (userId === currentUserId) {
      navigate('/profile');
    } else {
      // Pour les autres utilisateurs, on pourrait naviguer vers leur profil public
      toast({
        title: "Profil utilisateur",
        description: "Navigation vers les profils publics bientôt disponible"
      });
    }
  };

  const resetCreateForm = () => {
    setNewPost("");
    setSelectedFile(null);
    setSelectedFileType(null);
    setShowCreatePost(false);
    setEditingPost(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary animate-float" />
            <h1 className="text-2xl font-bold text-gradient-gold">Club</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              className="btn-golden" 
              onClick={() => requireAuth(() => setShowCreatePost(true))}
            >
              <Plus className="w-4 h-4 mr-2" />
              Poster
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6 animate-fade-in">
        {/* Create/Edit Post */}
        {showCreatePost && (
          <Card className="card-golden overflow-hidden">
            <CardHeader>
              <h3 className="font-semibold text-gradient-gold">
                {editingPost ? "Modifier la publication" : "Créer une publication"}
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Quoi de neuf dans le monde du football ?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[100px]"
              />
              
              {/* Aperçu du fichier sélectionné */}
              {selectedFile && (
                <div className="border rounded-lg p-3 bg-muted/50 overflow-hidden">
                  <div className="flex items-center gap-3">
                    {selectedFileType === 'image' ? (
                      <Image className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Video className="w-5 h-5 text-red-500" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedFile(null);
                        setSelectedFileType(null);
                      }}
                      className="flex-shrink-0"
                    >
                      ✕
                    </Button>
                  </div>
                  
                  {/* Aperçu image/vidéo */}
                  {selectedFileType === 'image' && (
                    <img 
                      src={URL.createObjectURL(selectedFile)} 
                      alt="Aperçu"
                      className="w-full h-32 object-cover rounded mt-2 max-w-full"
                      onError={(e) => {
                        console.error('Preview image failed to load');
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  {selectedFileType === 'video' && (
                    <div className="relative mt-2">
                      <video 
                        src={URL.createObjectURL(selectedFile)} 
                        className="w-full h-32 object-cover rounded max-w-full"
                        preload="metadata"
                        controls
                        onError={(e) => {
                          console.error('Preview video failed to load');
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowMediaModal(true)}
                    className="text-xs flex-shrink-0"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Photo/Vidéo
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPollModal(true)}
                    className="text-xs flex-shrink-0"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Sondage
                  </Button>
                </div>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={resetCreateForm}
                    className="text-xs"
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    className="btn-golden"
                    onClick={editingPost ? handleUpdatePost : handleCreatePost}
                    disabled={(!newPost.trim() && !selectedFile) || loading}
                  >
                    {loading ? "..." : (editingPost ? "Modifier" : "Publier")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feed */}
        <div className="space-y-4">
          {posts.map((post, index) => (
            <Card key={post.id} className="card-golden overflow-hidden">
              <CardContent className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <Avatar 
                    className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                    onClick={() => handleUserClick(post.user.id)}
                  >
                    <AvatarImage src={post.user.avatar} />
                    <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 
                        className="font-semibold text-sm cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleUserClick(post.user.id)}
                      >
                        {post.user.name}
                      </h3>
                      {post.user.verified && (
                        <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5">
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
                    onEdit={() => handleEditPost(post)}
                    onDelete={() => handleDeletePost(post.id)}
                    onFavorite={() => {
                      toast({
                        title: "Favoris",
                        description: "Post ajouté aux favoris"
                      });
                    }}
                    onReport={() => {
                      toast({
                        title: "Post signalé",
                        description: "Cette publication a été signalée aux modérateurs."
                      });
                    }}
                    onShare={() => handleShare(post)}
                    isFavorited={post.isFavorite}
                    isReported={post.isReported}
                    playsInline
                    preload="metadata"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
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
                              className="w-full justify-between p-3 h-auto text-left"
                              onClick={() => handleVotePoll(post.id, optionIndex)}
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
                <div className="flex items-center justify-between pt-2 border-t border-border/50 gap-2">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1 ${post.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
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
                      className="flex items-center gap-1 text-muted-foreground"
                    >
                      <MessageCircle size={16} />
                      <span className="text-xs">{post.comments}</span>
                    </Button>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground flex-shrink-0"
                    onClick={() => handleShare(post)}
                  >
                    <Share2 size={16} className="mr-1" />
                    <span className="text-xs">{post.shares}</span>
                  </Button>
                </div>

                {/* Quick Comment Input */}
                {showCommentInput === post.id && (
                  <div className="pt-3 border-t border-border/50 overflow-hidden">
                    <div className="flex gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={profile?.avatar} />
                        <AvatarFallback>{profile?.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2 min-w-0">
                        <Input
                          placeholder="Écrivez un commentaire..."
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && commentInput.trim()) {
                              handleAddComment(post.id, commentInput);
                              setCommentInput("");
                            }
                          }}
                          className="flex-1 min-w-0"
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            if (commentInput.trim()) {
                              handleAddComment(post.id, commentInput);
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
                        {postComments[post.id].slice(0, 3).map((comment) => (
                          <div key={comment.id} className="flex gap-2 bg-muted/30 rounded-lg p-2">
                            <Avatar className="w-6 h-6">
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
                            onClick={() => handleComment(post)}
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
          ))}
        </div>

        {/* Recommendations Section */}
        <Card className="card-golden overflow-hidden">
          <CardContent className="p-4 text-center space-y-3">
            <Trophy className="w-12 h-12 text-primary mx-auto animate-glow" />
            <h3 className="font-bold text-gradient-gold">
              Rejoignez la conversation !
            </h3>
            <p className="text-sm text-muted-foreground">
              Partagez vos opinions sur le Ballon d'Or 2025 avec la communauté
            </p>
            <div className="space-y-2 text-sm text-muted-foreground break-words">
              <p>• Créez des posts et sondages</p>
              <p>• Participez aux discussions</p>
              <p>• Suivez vos joueurs favoris</p>
              <p>• Votez pour les meilleurs contenus</p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Comment Modal */}
      {selectedPost && (
        <CommentModal 
          isOpen={showComments}
          onClose={() => setShowComments(false)}
          postId={selectedPost.id || selectedPost}
        />
      )}

      {/* Share Modal */}
      {selectedPost && (
        <ShareModal
          isOpen={showShare}
          onClose={() => setShowShare(false)}
          content={selectedPost}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Create Poll Modal */}
      <CreatePollModal
        isOpen={showPollModal}
        onClose={() => setShowPollModal(false)}
        onCreatePoll={handleCreatePoll}
      />

      {/* Media Upload Modal */}
      <MediaUploadModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onUpload={handleMediaUpload}
      />
    </div>
  );
}