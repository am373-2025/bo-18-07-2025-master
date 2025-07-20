/*
  # Chat System Complete Setup

  1. New Tables
    - `chat_groups` - Groups for chat conversations
    - `chat_group_members` - Group membership management 
    - `chat_messages` - All messages (private and group)
    - `notifications` - User notifications system

  2. Storage
    - Create 'media' bucket for chat files
    - Note: RLS policies must be set via Supabase dashboard

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
    - Proper access controls for group messaging

  4. Performance
    - Indexes for fast message queries
    - Functions for automatic counters
*/

-- Create media bucket for chat files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media', 
  'media', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Chat Groups Table
CREATE TABLE IF NOT EXISTS chat_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  avatar text,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  is_public boolean DEFAULT false,
  member_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chat Group Members Table
CREATE TABLE IF NOT EXISTS chat_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES chat_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Chat Messages Table (unified for private and group chats)
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  group_id uuid REFERENCES chat_groups(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'file')),
  media_url text,
  reply_to uuid REFERENCES chat_messages(id) ON DELETE SET NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_recipient CHECK (
    (receiver_id IS NOT NULL AND group_id IS NULL) OR 
    (receiver_id IS NULL AND group_id IS NOT NULL)
  )
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('like', 'comment', 'vote', 'trophy', 'follow', 'message', 'group_invite')),
  title text NOT NULL,
  content text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Chat Groups
CREATE POLICY "Users can view public groups" ON chat_groups
  FOR SELECT TO authenticated
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create groups" ON chat_groups
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group creators can update their groups" ON chat_groups
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid());

-- RLS Policies for Group Members
CREATE POLICY "Users can view group members if they are members" ON chat_group_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM chat_group_members cgm 
      WHERE cgm.group_id = chat_group_members.group_id 
      AND cgm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join groups" ON chat_group_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave groups" ON chat_group_members
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for Chat Messages
CREATE POLICY "Users can view their messages" ON chat_messages
  FOR SELECT TO authenticated
  USING (
    sender_id = auth.uid() OR 
    receiver_id = auth.uid() OR
    (group_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM chat_group_members cgm 
      WHERE cgm.group_id = chat_messages.group_id 
      AND cgm.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can send messages" ON chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages" ON chat_messages
  FOR UPDATE TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- RLS Policies for Notifications
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_groups_public ON chat_groups(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_chat_groups_created_by ON chat_groups(created_by);

CREATE INDEX IF NOT EXISTS idx_chat_group_members_group ON chat_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_chat_group_members_user ON chat_group_members(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver ON chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_group ON chat_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON chat_messages(receiver_id, is_read) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

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
    SET member_count = GREATEST(0, member_count - 1) 
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for group member count
DROP TRIGGER IF EXISTS update_group_member_count_trigger ON chat_group_members;
CREATE TRIGGER update_group_member_count_trigger
  AFTER INSERT OR DELETE ON chat_group_members
  FOR EACH ROW EXECUTE FUNCTION update_group_member_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_chat_groups_updated_at ON chat_groups;
CREATE TRIGGER update_chat_groups_updated_at 
  BEFORE UPDATE ON chat_groups 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON chat_messages;
CREATE TRIGGER update_chat_messages_updated_at 
  BEFORE UPDATE ON chat_messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at 
  BEFORE UPDATE ON notifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create notification for new messages
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification for private messages (not group messages)
  IF NEW.receiver_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, content, data)
    VALUES (
      NEW.receiver_id,
      'message',
      'Nouveau message',
      COALESCE(
        (SELECT name FROM profiles WHERE id = NEW.sender_id),
        'Utilisateur'
      ) || ' vous a envoyé un message',
      jsonb_build_object(
        'message_id', NEW.id,
        'sender_id', NEW.sender_id,
        'chat_id', NEW.sender_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for message notifications
DROP TRIGGER IF EXISTS create_message_notification_trigger ON chat_messages;
CREATE TRIGGER create_message_notification_trigger
  AFTER INSERT ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION create_message_notification();