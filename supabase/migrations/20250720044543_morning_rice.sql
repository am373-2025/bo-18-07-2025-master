/*
  # Ajouter tables pour likes et commentaires utilisateur

  1. Nouvelles Tables
    - `user_post_likes` : Likes des utilisateurs sur les posts
    - `user_post_comments` : Commentaires des utilisateurs sur les posts

  2. Sécurité  
    - Enable RLS sur toutes les tables
    - Politiques pour permettre aux utilisateurs de gérer leurs propres likes/commentaires
    - Lecture publique pour tous les likes/commentaires

  3. Structure
    - Likes : user_id, post_id, created_at
    - Commentaires : user_id, post_id, content, created_at
*/

-- Table pour les likes des posts
CREATE TABLE IF NOT EXISTS user_post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  post_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Table pour les commentaires des posts  
CREATE TABLE IF NOT EXISTS user_post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  post_id uuid NOT NULL,
  content text NOT NULL,
  likes integer DEFAULT 0,
  parent_id uuid REFERENCES user_post_comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_post_comments ENABLE ROW LEVEL SECURITY;

-- Politiques pour les likes
CREATE POLICY "Users can insert own likes"
  ON user_post_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON user_post_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all likes"
  ON user_post_likes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Politiques pour les commentaires
CREATE POLICY "Users can insert own comments"
  ON user_post_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON user_post_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON user_post_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all comments"
  ON user_post_comments
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_user_post_likes_post_id ON user_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_user_post_likes_user_id ON user_post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_post_comments_post_id ON user_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_user_post_comments_user_id ON user_post_comments(user_id);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column_comments()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_post_comments_updated_at
    BEFORE UPDATE ON user_post_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column_comments();