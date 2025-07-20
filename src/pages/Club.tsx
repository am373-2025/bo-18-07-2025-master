import React from "react";
import { useState, useEffect } from "react";
import { Users, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { CreatePostForm } from "@/components/club/CreatePostForm";
import { PostCard } from "@/components/club/PostCard";
import { CommentModal } from "@/components/ui/comment-modal";
import { ShareModal } from "@/components/ui/share-modal";
import { LoginModal } from "@/components/ui/login-modal";
import { CreatePollModal } from "@/components/ui/create-poll-modal";
import { MediaUploadModal } from "@/components/ui/media-upload-modal";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

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
            <CreatePostForm
              isOpen={showCreatePost}
              onClose={resetCreateForm}
              post={newPost}
              setPost={setNewPost}
              onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
              onShowMedia={() => setShowMediaModal(true)}
              onShowPoll={() => setShowPollModal(true)}
              loading={loading}
              selectedFile={selectedFile}
              selectedFileType={selectedFileType}
              onRemoveFile={() => {
                setSelectedFile(null);
                setSelectedFileType(null);
              }}
              editingPost={editingPost}
            />
          </Card>
        )}

        {/* Feed */}
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              userProfile={profile}
              onLike={handleLike}
              onShare={handleShare}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
              onVotePoll={handleVotePoll}
              onUserClick={handleUserClick}
              onAddComment={handleAddComment}
              showCommentInput={showCommentInput}
              setShowCommentInput={setShowCommentInput}
              commentInput={commentInput}
              setCommentInput={setCommentInput}
              postComments={postComments}
            />
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