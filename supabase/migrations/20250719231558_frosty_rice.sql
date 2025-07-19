/*
  # Create User Data Tables

  1. New Tables
    - `user_votes` - Store user votes for players
    - `user_favorites` - Store user favorite players
    - `user_posts` - Store user posts/publications
    - `user_comments` - Store user comments

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
*/

-- User votes table
CREATE TABLE IF NOT EXISTS user_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  player_id text NOT NULL,
  player_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  player_id text NOT NULL,
  player_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, player_id)
);

-- User posts table
CREATE TABLE IF NOT EXISTS user_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  image_url text,
  video_url text,
  post_type text DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video', 'poll')),
  likes integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User comments table
CREATE TABLE IF NOT EXISTS user_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_id text NOT NULL, -- Can be post_id, player_id, etc.
  target_type text NOT NULL CHECK (target_type IN ('post', 'player', 'formation')),
  content text NOT NULL,
  likes integer DEFAULT 0,
  parent_id uuid REFERENCES user_comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE user_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_comments ENABLE ROW LEVEL SECURITY;

-- Policies for user_votes
CREATE POLICY "Users can view all votes"
  ON user_votes
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert own votes"
  ON user_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON user_votes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for user_favorites
CREATE POLICY "Users can view own favorites"
  ON user_favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON user_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON user_favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for user_posts
CREATE POLICY "Users can view all posts"
  ON user_posts
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert own posts"
  ON user_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON user_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON user_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for user_comments
CREATE POLICY "Users can view all comments"
  ON user_comments
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert own comments"
  ON user_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON user_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON user_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_votes_user_id ON user_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_votes_player_id ON user_votes(player_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_posts_user_id ON user_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_comments_user_id ON user_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_comments_target ON user_comments(target_id, target_type);

-- Triggers for updated_at
CREATE TRIGGER update_user_posts_updated_at
  BEFORE UPDATE ON user_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_comments_updated_at
  BEFORE UPDATE ON user_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();