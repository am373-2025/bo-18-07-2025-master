/*
  # Schema complet de l'application Ballon d'Or 2025

  1. Authentification et profils utilisateur
  2. Système de votes et favoris
  3. Publications et commentaires
  4. Chat et conversations
  5. Classements et statistiques
  6. Permissions et sécurité RLS
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  username TEXT UNIQUE,
  email TEXT,
  bio TEXT DEFAULT '',
  avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT false,
  stats JSONB DEFAULT '{"votes": 0, "posts": 0, "likes": 0, "comments": 0}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. PLAYERS TABLE
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  club TEXT NOT NULL,
  photo TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  country TEXT,
  age INTEGER,
  ranking INTEGER,
  trend TEXT CHECK (trend IN ('up', 'down', 'stable')),
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Players policies
CREATE POLICY "Anyone can view players" ON players FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Admins can manage players" ON players FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 3. USER VOTES TABLE
CREATE TABLE IF NOT EXISTS user_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_votes ENABLE ROW LEVEL SECURITY;

-- User votes policies
CREATE POLICY "Users can view all votes" ON user_votes FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Users can insert own votes" ON user_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON user_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 4. USER FAVORITES TABLE
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, player_id)
);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- User favorites policies
CREATE POLICY "Users can view own favorites" ON user_favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON user_favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON user_favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5. USER POSTS TABLE
CREATE TABLE IF NOT EXISTS user_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video', 'poll')),
  poll_data JSONB,
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_posts ENABLE ROW LEVEL SECURITY;

-- User posts policies
CREATE POLICY "Users can view all posts" ON user_posts FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Users can insert own posts" ON user_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON user_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON user_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 6. USER COMMENTS TABLE
CREATE TABLE IF NOT EXISTS user_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES user_posts(id) ON DELETE CASCADE,
  target_id TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'player', 'formation')),
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  parent_id UUID REFERENCES user_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_comments ENABLE ROW LEVEL SECURITY;

-- User comments policies
CREATE POLICY "Users can view all comments" ON user_comments FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Users can insert own comments" ON user_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON user_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON user_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 7. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('private', 'group')),
  description TEXT,
  avatar TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- 8. CONVERSATION PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- 9. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'file')),
  media_url TEXT,
  reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view conversations they participate in" ON conversations FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = conversations.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create conversations" ON conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Participants policies
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp2
    WHERE cp2.conversation_id = conversation_participants.conversation_id AND cp2.user_id = auth.uid()
  )
);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages in their conversations" ON messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
  )
);

-- 10. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
CREATE INDEX IF NOT EXISTS idx_players_ranking ON players(ranking);
CREATE INDEX IF NOT EXISTS idx_players_votes ON players(votes DESC);
CREATE INDEX IF NOT EXISTS idx_user_votes_user_id ON user_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_votes_player_id ON user_votes(player_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_posts_user_id ON user_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_comments_target ON user_comments(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_user_comments_user_id ON user_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);

-- 11. CREATE UPDATE TRIGGERS
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_posts_updated_at BEFORE UPDATE ON user_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_comments_updated_at BEFORE UPDATE ON user_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. INSERT SAMPLE DATA
INSERT INTO players (id, slug, name, position, club, photo, votes, country, age, ranking, trend) VALUES
('1', 'kylian-mbappe', 'Kylian Mbappé', 'Attaquant', 'Real Madrid', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', 12456, 'France', 25, 1, 'up'),
('2', 'erling-haaland', 'Erling Haaland', 'Attaquant', 'Manchester City', 'https://images.unsplash.com/photo-1556506751-69a7d6fb64dd?w=400&h=300&fit=crop', 11234, 'Norvège', 24, 2, 'stable'),
('3', 'jude-bellingham', 'Jude Bellingham', 'Milieu', 'Real Madrid', 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=400&h=300&fit=crop', 9876, 'Angleterre', 21, 3, 'up'),
('4', 'pedri-gonzalez', 'Pedri González', 'Milieu', 'FC Barcelone', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop', 8765, 'Espagne', 22, 4, 'down'),
('5', 'vinicius-jr', 'Vinicius Jr', 'Ailier', 'Real Madrid', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop', 8200, 'Brésil', 24, 5, 'up')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  position = EXCLUDED.position,
  club = EXCLUDED.club,
  photo = EXCLUDED.photo,
  votes = EXCLUDED.votes,
  country = EXCLUDED.country,
  age = EXCLUDED.age,
  ranking = EXCLUDED.ranking,
  trend = EXCLUDED.trend,
  updated_at = NOW();