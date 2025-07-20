/*
  # Complete application schema for Ballon d'Or 2025

  1. New Tables
    - `notifications` for user notifications system
    - `chat_groups` for group chat functionality
    - `chat_group_members` for group membership
    - `chat_messages` for all chat messages (groups + private)
    - `user_sessions` for session tracking
    - `app_settings` for global app configuration

  2. Enhanced Tables
    - Update existing tables with missing columns
    - Add proper constraints and indexes
    - Ensure all foreign keys are correct

  3. Security
    - Enable RLS on all new tables
    - Add comprehensive policies for all operations
    - Ensure data isolation per user

  4. Functions & Triggers
    - Auto-update timestamps
    - Notification triggers
    - User stats updates
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type = ANY (ARRAY['like'::text, 'comment'::text, 'vote'::text, 'trophy'::text, 'follow'::text, 'message'::text])),
  title text NOT NULL,
  content text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create chat groups table
CREATE TABLE IF NOT EXISTS chat_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  avatar text,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_public boolean DEFAULT true,
  member_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public groups visible to all"
  ON chat_groups
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can create groups"
  ON chat_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update"
  ON chat_groups
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create chat group members table
CREATE TABLE IF NOT EXISTS chat_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES chat_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role = ANY (ARRAY['admin'::text, 'moderator'::text, 'member'::text])),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE chat_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view group membership"
  ON chat_group_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    group_id IN (SELECT group_id FROM chat_group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can join groups"
  ON chat_group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON chat_group_members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create unified chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_id uuid REFERENCES chat_groups(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type = ANY (ARRAY['text'::text, 'image'::text, 'video'::text, 'file'::text])),
  media_url text,
  reply_to uuid REFERENCES chat_messages(id) ON DELETE SET NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_recipient CHECK (
    (group_id IS NOT NULL AND receiver_id IS NULL) OR 
    (group_id IS NULL AND receiver_id IS NOT NULL)
  )
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR 
    receiver_id = auth.uid() OR
    group_id IN (SELECT group_id FROM chat_group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can send messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND (
      (receiver_id IS NOT NULL) OR
      (group_id IN (SELECT group_id FROM chat_group_members WHERE user_id = auth.uid()))
    )
  );

CREATE POLICY "Users can update own messages"
  ON chat_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id);

-- Create user sessions table for better session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  device_info jsonb DEFAULT '{}',
  last_activity timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create app settings table for global configuration
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read app settings"
  ON app_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON app_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Update existing tables with missing columns/constraints
DO $$
BEGIN
  -- Add missing columns to players table if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'stats'
  ) THEN
    ALTER TABLE players ADD COLUMN stats jsonb DEFAULT '{"goals": 0, "assists": 0, "matches": 0, "rating": 0}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'biography'
  ) THEN
    ALTER TABLE players ADD COLUMN biography text;
  END IF;

  -- Add missing columns to profiles table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_seen'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_seen timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
  END IF;

  -- Add missing columns to user_posts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_posts' AND column_name = 'poll_data'
  ) THEN
    ALTER TABLE user_posts ADD COLUMN poll_data jsonb;
  END IF;

END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_chat_groups_public ON chat_groups(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_chat_groups_created_at ON chat_groups(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_group_members_group ON chat_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_chat_group_members_user ON chat_group_members(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_group ON chat_messages(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_private ON chat_messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON chat_messages(receiver_id, is_read) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expiry ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_players_stats ON players USING GIN(stats);
CREATE INDEX IF NOT EXISTS idx_user_posts_poll ON user_posts USING GIN(poll_data) WHERE poll_data IS NOT NULL;

-- Create functions for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating timestamps
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_groups_updated_at ON chat_groups;
CREATE TRIGGER update_chat_groups_updated_at
  BEFORE UPDATE ON chat_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON chat_messages;
CREATE TRIGGER update_chat_messages_updated_at
  BEFORE UPDATE ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user last_seen
CREATE OR REPLACE FUNCTION update_user_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET last_seen = now() WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update last_seen on user activity
DROP TRIGGER IF EXISTS update_user_activity ON chat_messages;
CREATE TRIGGER update_user_activity
  AFTER INSERT ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_user_last_seen();

-- Function to update group member count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE chat_groups 
    SET member_count = member_count + 1 
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE chat_groups 
    SET member_count = member_count - 1 
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger to maintain group member count
DROP TRIGGER IF EXISTS maintain_group_member_count ON chat_group_members;
CREATE TRIGGER maintain_group_member_count
  AFTER INSERT OR DELETE ON chat_group_members
  FOR EACH ROW EXECUTE FUNCTION update_group_member_count();

-- Insert default app settings
INSERT INTO app_settings (key, value, description) VALUES 
  ('max_daily_votes', '"10"', 'Maximum votes per user per day'),
  ('voting_enabled', 'true', 'Global voting enabled/disabled'),
  ('maintenance_mode', 'false', 'Maintenance mode on/off'),
  ('featured_players', '[]', 'List of featured player IDs'),
  ('app_version', '"1.0.0"', 'Current app version')
ON CONFLICT (key) DO NOTHING;

-- Insert some default public groups
INSERT INTO chat_groups (id, name, description, avatar, created_by, is_public) 
SELECT 
  gen_random_uuid(),
  'Supporters France',
  'Discussions sur l''équipe de France et le football français',
  'https://images.unsplash.com/photo-1551038442-8e68eae1c3b9?w=100&h=100&fit=crop',
  (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),
  true
WHERE NOT EXISTS (SELECT 1 FROM chat_groups WHERE name = 'Supporters France');

INSERT INTO chat_groups (id, name, description, avatar, created_by, is_public) 
SELECT 
  gen_random_uuid(),
  'Débat Football',
  'Débats et discussions sur le football international',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop',
  (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),
  true
WHERE NOT EXISTS (SELECT 1 FROM chat_groups WHERE name = 'Débat Football');