// Système de profils utilisateur avec Supabase + fallback localStorage

import { supabase, storage } from "@/lib/supabaseClient";
import type { UserProfile } from "@/types";

export const createEmptyUserProfile = (userId: string): UserProfile => ({
  id: userId,
  name: "",
  username: "",
  bio: "",
  avatar: "/placeholder.svg",
  followers: 0,
  following: 0,
  joinDate: `Membre depuis ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
  favorites: [],
  stats: {
    votes: 0,
    posts: 0,
    likes: 0,
    comments: 0
  }
});

// Helpers asynchrones pour gérer les profils utilisateur
export async function getCurrentProfile(): Promise<UserProfile | null> {
  try {
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (!error && data) {
          return data as UserProfile;
        }
      }
    }
    
    // Fallback to localStorage
    const stored = storage.get('currentUserProfile', null);
    if (stored) {
      return stored;
    }
    
    // Create default profile
    const defaultProfile = createEmptyUserProfile('user-1');
    storage.set('currentUserProfile', defaultProfile);
    return defaultProfile;
  } catch (error) {
    console.error('Error getting current profile:', error);
    return null;
  }
}

export async function updateCurrentProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();
          
        if (!error && data) {
          return data as UserProfile;
        }
      }
    }
    
    // Fallback to localStorage
    const current = await getCurrentProfile();
    if (!current) return null;
    const updated = { ...current, ...updates };
    storage.set('currentUserProfile', updated);
    return updated;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
}

export async function createOrUpdateUserProfile(fields: Partial<UserProfile>): Promise<UserProfile | null> {
  const current = await getCurrentProfile();
  
  if (current) {
    return updateCurrentProfile(fields);
  } else {
    return createNewUser(fields);
  }
}

export async function createNewUser(fields: Partial<UserProfile> = {}): Promise<UserProfile | null> {
  try {
    const profile = { ...createEmptyUserProfile('user-1'), ...fields };
    
    if (supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .insert([profile])
        .select()
        .single();
        
      if (!error && data) {
        return data as UserProfile;
      }
    }
    
    // Fallback to localStorage
    storage.set('currentUserProfile', profile);
    return profile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
}

export async function switchUser(userId: string): Promise<UserProfile | null> {
  // Mock user switching with localStorage
  const profile = createEmptyUserProfile(userId);
  localStorage.setItem('currentUserProfile', JSON.stringify(profile));
  return profile;
}

// --- Votes ---
export async function addVote(player_id: string) {
  const votes = JSON.parse(localStorage.getItem('userVotes') || '[]');
  votes.push({ user_id: 'user-1', player_id, created_at: new Date().toISOString() });
  localStorage.setItem('userVotes', JSON.stringify(votes));
  return { data: votes[votes.length - 1], error: null };
}

export async function getUserVotes() {
  return JSON.parse(localStorage.getItem('userVotes') || '[]');
}

// --- Commentaires ---
export async function addComment(target_id: string, content: string) {
  const comments = JSON.parse(localStorage.getItem('userComments') || '[]');
  comments.push({ user_id: 'user-1', target_id, content, created_at: new Date().toISOString() });
  localStorage.setItem('userComments', JSON.stringify(comments));
  return { data: comments[comments.length - 1], error: null };
}

export async function getUserComments() {
  return JSON.parse(localStorage.getItem('userComments') || '[]');
}

// --- Publications ---
export async function addPost(content: string) {
  const posts = JSON.parse(localStorage.getItem('userPosts') || '[]');
  posts.push({ user_id: 'user-1', content, created_at: new Date().toISOString() });
  localStorage.setItem('userPosts', JSON.stringify(posts));
  return { data: posts[posts.length - 1], error: null };
}

export async function getUserPosts() {
  return JSON.parse(localStorage.getItem('userPosts') || '[]');
}