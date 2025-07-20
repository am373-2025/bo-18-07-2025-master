/*
  # Add stats column to profiles table

  1. Changes
    - Add `stats` column to `profiles` table as JSONB type
    - Set default value with votes, posts, likes, comments counters
    - Update existing profiles to have the default stats structure

  2. Security
    - No RLS changes needed (existing policies still apply)
*/

-- Add stats column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stats'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stats JSONB DEFAULT '{"votes": 0, "posts": 0, "likes": 0, "comments": 0}';
  END IF;
END $$;

-- Update existing profiles that might have NULL stats
UPDATE profiles 
SET stats = '{"votes": 0, "posts": 0, "likes": 0, "comments": 0}'
WHERE stats IS NULL;