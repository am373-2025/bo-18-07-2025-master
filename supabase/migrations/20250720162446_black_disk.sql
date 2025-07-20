/*
  # Add media storage for chat system

  1. Storage
    - Create 'media' bucket for chat files (images, videos, documents)
    - Set up RLS policies for media access
    
  2. Updates
    - Add indexes for better performance
    - Update chat_messages table if needed
*/

-- Create storage bucket for chat media
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('media', 'media', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Create RLS policies for media bucket
CREATE POLICY "Users can upload their own media" ON storage.objects
  FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'media');

CREATE POLICY "Users can view all media" ON storage.objects
  FOR SELECT 
  TO authenticated 
  USING (bucket_id = 'media');

CREATE POLICY "Users can update their own media" ON storage.objects
  FOR UPDATE 
  TO authenticated 
  USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own media" ON storage.objects
  FOR DELETE 
  TO authenticated 
  USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_group_created ON chat_messages(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_search ON profiles USING gin(to_tsvector('french', name || ' ' || COALESCE(username, '')));

-- Function to update last_seen when user is active
CREATE OR REPLACE FUNCTION update_user_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET last_seen = now()
  WHERE id = NEW.sender_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_seen on message send
DROP TRIGGER IF EXISTS update_last_seen_on_message ON chat_messages;
CREATE TRIGGER update_last_seen_on_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_seen();

-- Function to increment group member count
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
$$ LANGUAGE plpgsql;

-- Trigger to manage group member count
DROP TRIGGER IF EXISTS manage_group_member_count ON chat_group_members;
CREATE TRIGGER manage_group_member_count
  AFTER INSERT OR DELETE ON chat_group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_group_member_count();