/*
  # Fix foreign key relationship for user_post_comments

  1. Foreign Key Fix
    - Add foreign key constraint between user_post_comments.user_id and profiles.id
    - This enables Supabase to join tables and fetch profile data with comments

  2. Security
    - Maintains existing RLS policies
    - Ensures data integrity with proper relationships
*/

-- Add foreign key constraint to link user_post_comments to profiles
ALTER TABLE user_post_comments
ADD CONSTRAINT user_post_comments_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;