/*
  # Create players table

  1. New Tables
    - `players`
      - `id` (text, primary key)
      - `slug` (text, optional)
      - `name` (text, not null)
      - `position` (text, not null)
      - `club` (text, not null)
      - `photo` (text, not null)
      - `votes` (integer, default 0)
      - `isLiked` (boolean, default false)
      - `country` (text, optional)
      - `age` (integer, optional)
      - `ranking` (integer, optional)
      - `trend` (text, optional)
      - `created_at` (timestamp, default now)
      - `updated_at` (timestamp, default now)

  2. Security
    - Enable RLS on `players` table
    - Add policy for public read access
    - Add policy for authenticated users to insert/update
*/

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id text PRIMARY KEY,
  slug text,
  name text NOT NULL,
  position text NOT NULL,
  club text NOT NULL,
  photo text NOT NULL,
  votes integer DEFAULT 0,
  isLiked boolean DEFAULT false,
  country text,
  age integer,
  ranking integer,
  trend text CHECK (trend IN ('up', 'down', 'stable')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Allow public read access to players
CREATE POLICY "Allow public read access to players"
  ON players
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users to insert players
CREATE POLICY "Allow authenticated users to insert players"
  ON players
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update players
CREATE POLICY "Allow authenticated users to update players"
  ON players
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
CREATE INDEX IF NOT EXISTS idx_players_ranking ON players(ranking);
CREATE INDEX IF NOT EXISTS idx_players_votes ON players(votes DESC);