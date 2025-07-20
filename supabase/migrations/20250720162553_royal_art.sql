/*
  # Add media storage for chat system

  1. Storage
    - Create 'media' bucket for chat files (images, videos, documents)
    - Set up RLS policies for media access
  
  2. Updates
    - Add indexes for better performance
    - Update chat_messages table if needed
*/

-- Create media bucket for chat files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  10485760, -- 10MB limit
  ARRAY[
    'image/jpeg',
    'image/png', 
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/pdf',
    'text/plain'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view media files
CREATE POLICY "Users can view media files"
  ON storage.objects
  FOR SELECT
  TO authenticated, anon
  USING (bucket_id = 'media');

-- Policy: Users can upload media files
CREATE POLICY "Users can upload media files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can update their own media files
CREATE POLICY "Users can update their own media files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can delete their own media files
CREATE POLICY "Users can delete their own media files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add indexes for better chat performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation 
  ON chat_messages (sender_id, receiver_id, created_at DESC)
  WHERE group_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_chat_messages_group 
  ON chat_messages (group_id, created_at DESC)
  WHERE group_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_messages_unread 
  ON chat_messages (receiver_id, is_read, created_at DESC)
  WHERE receiver_id IS NOT NULL AND is_read = false;

CREATE INDEX IF NOT EXISTS idx_profiles_search 
  ON profiles USING gin(to_tsvector('french', name || ' ' || COALESCE(username, '')));

CREATE INDEX IF NOT EXISTS idx_profiles_last_seen 
  ON profiles (last_seen DESC);

-- Add media_size column to chat_messages if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'media_size'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN media_size bigint;
  END IF;
END $$;

-- Add media_name column to chat_messages if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'media_name'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN media_name text;
  END IF;
END $$;

-- Function to clean up old media files (optional)
CREATE OR REPLACE FUNCTION cleanup_old_media()
RETURNS void AS $$
BEGIN
  -- Delete media files older than 30 days that are not referenced in messages
  DELETE FROM storage.objects 
  WHERE bucket_id = 'media' 
    AND created_at < NOW() - INTERVAL '30 days'
    AND name NOT IN (
      SELECT DISTINCT media_url 
      FROM chat_messages 
      WHERE media_url IS NOT NULL
        AND media_url LIKE '%' || name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update chat group member count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS trigger AS $$
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

-- Trigger to automatically update group member count
DROP TRIGGER IF EXISTS update_group_member_count_trigger ON chat_group_members;
CREATE TRIGGER update_group_member_count_trigger
  AFTER INSERT OR DELETE ON chat_group_members
  FOR EACH ROW EXECUTE FUNCTION update_group_member_count();

-- Update existing chat_groups member_count
UPDATE chat_groups 
SET member_count = (
  SELECT COUNT(*) 
  FROM chat_group_members 
  WHERE group_id = chat_groups.id
);