// Système de profils utilisateur via Supabase

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatar: string;
  followers: number;
  following: number;
  joinDate: string;
  favorites: string[];
  stats: {
    votes: number;
    posts: number;
    likes: number;
  };
}

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
    likes: 0
  }
});

// Helpers asynchrones pour gérer les profils utilisateur dans Supabase
export async function getCurrentProfile(): Promise<UserProfile | null> {
  // Using localStorage instead of Supabase
  const stored = localStorage.getItem('currentUserProfile');
  if (stored) {
    return JSON.parse(stored);
  }
  // Create default profile
  const defaultProfile = createEmptyUserProfile('user-1');
  localStorage.setItem('currentUserProfile', JSON.stringify(defaultProfile));
  return defaultProfile;
}

export async function updateCurrentProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
  const current = await getCurrentProfile();
  if (!current) return null;
  const updated = { ...current, ...updates };
  localStorage.setItem('currentUserProfile', JSON.stringify(updated));
  return updated;
}

export async function createNewUser(): Promise<UserProfile | null> {
  const emptyProfile = createEmptyUserProfile('user-1');
  localStorage.setItem('currentUserProfile', JSON.stringify(emptyProfile));
  return emptyProfile;
}

export async function switchUser(userId: string): Promise<UserProfile | null> {
  // Mock user switching with localStorage
  const profile = createEmptyUserProfile(userId);
  localStorage.setItem('currentUserProfile', JSON.stringify(profile));
  return profile;
}

export async function createOrUpdateUserProfile(fields: Partial<UserProfile>): Promise<UserProfile | null> {
  const current = await getCurrentProfile();
  const profile = current ? { ...current, ...fields } : { ...createEmptyUserProfile('user-1'), ...fields };
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