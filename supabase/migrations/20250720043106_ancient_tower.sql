/*
  # Ajouter les 30 joueurs favoris Ballon d'Or 2025

  1. Nouveaux joueurs
    - 30 candidats réalistes au Ballon d'Or 2025
    - Données complètes : nom, position, club, pays, âge, ranking
    - Photos et votes initiaux basés sur la popularité

  2. Conformité schéma
    - Types de données respectés (text, integer, timestamptz)
    - Contraintes de trend respectées (up/down/stable)
    - Pas de colonne isliked (n'existe pas dans le schéma)
    - IDs uniques et slugs générés automatiquement
*/

-- Insérer les 30 joueurs favoris Ballon d'Or 2025
INSERT INTO players (
  id, slug, name, position, club, photo, votes, country, age, ranking, trend, created_at, updated_at
) VALUES 
  -- Top 10
  ('mbappe-2025', 'kylian-mbappe', 'Kylian Mbappé', 'Attaquant', 'Real Madrid', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', 15420, 'France', 26, 1, 'up', now(), now()),
  ('haaland-2025', 'erling-haaland', 'Erling Haaland', 'Attaquant', 'Manchester City', 'https://images.unsplash.com/photo-1556506751-69a7d6fb64dd?w=400&h=300&fit=crop', 14750, 'Norvège', 24, 2, 'stable', now(), now()),
  ('bellingham-2025', 'jude-bellingham', 'Jude Bellingham', 'Milieu', 'Real Madrid', 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=400&h=300&fit=crop', 13890, 'Angleterre', 21, 3, 'up', now(), now()),
  ('vinicius-2025', 'vinicius-junior', 'Vinicius Jr', 'Ailier', 'Real Madrid', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop', 12650, 'Brésil', 24, 4, 'down', now(), now()),
  ('messi-2025', 'lionel-messi', 'Lionel Messi', 'Attaquant', 'Inter Miami', 'https://images.unsplash.com/photo-1563207153-f403bf289096?w=400&h=300&fit=crop', 12100, 'Argentine', 37, 5, 'down', now(), now()),
  ('rodri-2025', 'rodri-hernandez', 'Rodri', 'Milieu défensif', 'Manchester City', 'https://images.unsplash.com/photo-1552667466-07770ae110d0?w=400&h=300&fit=crop', 11200, 'Espagne', 28, 6, 'up', now(), now()),
  ('musiala-2025', 'jamal-musiala', 'Jamal Musiala', 'Milieu offensif', 'Bayern Munich', 'https://images.unsplash.com/photo-1542103749-8ef59b94f47e?w=400&h=300&fit=crop', 10800, 'Allemagne', 22, 7, 'up', now(), now()),
  ('rice-2025', 'declan-rice', 'Declan Rice', 'Milieu défensif', 'Arsenal', 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop', 10400, 'Angleterre', 26, 8, 'stable', now(), now()),
  ('yamal-2025', 'lamine-yamal', 'Lamine Yamal', 'Ailier', 'FC Barcelona', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop', 10100, 'Espagne', 17, 9, 'up', now(), now()),
  ('kane-2025', 'harry-kane', 'Harry Kane', 'Attaquant', 'Bayern Munich', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop', 9750, 'Angleterre', 31, 10, 'stable', now(), now()),

  -- Places 11-20
  ('salah-2025', 'mohamed-salah', 'Mohamed Salah', 'Ailier', 'Liverpool', 'https://images.unsplash.com/photo-1564982508714-4078ae72051c?w=400&h=300&fit=crop', 9200, 'Égypte', 32, 11, 'down', now(), now()),
  ('dembele-2025', 'ousmane-dembele', 'Ousmane Dembélé', 'Ailier', 'PSG', 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=300&fit=crop', 8900, 'France', 27, 12, 'up', now(), now()),
  ('saka-2025', 'bukayo-saka', 'Bukayo Saka', 'Ailier', 'Arsenal', 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=300&fit=crop', 8600, 'Angleterre', 23, 13, 'up', now(), now()),
  ('odegaard-2025', 'martin-odegaard', 'Martin Ødegaard', 'Milieu offensif', 'Arsenal', 'https://images.unsplash.com/photo-1512127950790-67ba9fab98c4?w=400&h=300&fit=crop', 8300, 'Norvège', 26, 14, 'stable', now(), now()),
  ('foden-2025', 'phil-foden', 'Phil Foden', 'Milieu offensif', 'Manchester City', 'https://images.unsplash.com/photo-1568627910382-b7b0bb3f3ef6?w=400&h=300&fit=crop', 8000, 'Angleterre', 24, 15, 'down', now(), now()),
  ('wirtz-2025', 'florian-wirtz', 'Florian Wirtz', 'Milieu offensif', 'Bayer Leverkusen', 'https://images.unsplash.com/photo-1583531172005-814191b8b6c5?w=400&h=300&fit=crop', 7700, 'Allemagne', 21, 16, 'up', now(), now()),
  ('pedri-2025', 'pedri-gonzalez', 'Pedri', 'Milieu', 'FC Barcelona', 'https://images.unsplash.com/photo-1541922004154-e4370bb36706?w=400&h=300&fit=crop', 7400, 'Espagne', 22, 17, 'stable', now(), now()),
  ('leao-2025', 'rafael-leao', 'Rafael Leão', 'Ailier', 'AC Milan', 'https://images.unsplash.com/photo-1566895291281-0a5a57f69a0c?w=400&h=300&fit=crop', 7100, 'Portugal', 25, 18, 'down', now(), now()),
  ('gavi-2025', 'pablo-gavi', 'Gavi', 'Milieu', 'FC Barcelona', 'https://images.unsplash.com/photo-1591154669695-5f2a8d20c089?w=400&h=300&fit=crop', 6800, 'Espagne', 20, 19, 'stable', now(), now()),
  ('guirassy-2025', 'serhou-guirassy', 'Serhou Guirassy', 'Attaquant', 'Borussia Dortmund', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop', 6500, 'Guinée', 28, 20, 'up', now(), now()),

  -- Places 21-30
  ('martinez-2025', 'lautaro-martinez', 'Lautaro Martínez', 'Attaquant', 'Inter Milan', 'https://images.unsplash.com/photo-1586902279476-3244d8d18285?w=400&h=300&fit=crop', 6200, 'Argentine', 27, 21, 'stable', now(), now()),
  ('osimhen-2025', 'victor-osimhen', 'Victor Osimhen', 'Attaquant', 'Napoli', 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop', 5900, 'Nigeria', 26, 22, 'down', now(), now()),
  ('kvara-2025', 'khvicha-kvaratskhelia', 'Khvicha Kvaratskhelia', 'Ailier', 'Napoli', 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop', 5600, 'Géorgie', 23, 23, 'down', now(), now()),
  ('barella-2025', 'nicolo-barella', 'Nicolò Barella', 'Milieu', 'Inter Milan', 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=400&h=300&fit=crop', 5300, 'Italie', 28, 24, 'stable', now(), now()),
  ('bruno-2025', 'bruno-fernandes', 'Bruno Fernandes', 'Milieu offensif', 'Manchester United', 'https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=400&h=300&fit=crop', 5000, 'Portugal', 30, 25, 'down', now(), now()),
  ('hakimi-2025', 'achraf-hakimi', 'Achraf Hakimi', 'Arrière droit', 'PSG', 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=400&h=300&fit=crop', 4700, 'Maroc', 26, 26, 'stable', now(), now()),
  ('tchouameni-2025', 'aurelien-tchouameni', 'Aurélien Tchouaméni', 'Milieu défensif', 'Real Madrid', 'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?w=400&h=300&fit=crop', 4400, 'France', 25, 27, 'stable', now(), now()),
  ('alvarez-2025', 'julian-alvarez', 'Julián Álvarez', 'Attaquant', 'Atlético Madrid', 'https://images.unsplash.com/photo-1606115915090-be18fea23ec7?w=400&h=300&fit=crop', 4100, 'Argentine', 24, 28, 'up', now(), now()),
  ('lewandowski-2025', 'robert-lewandowski', 'Robert Lewandowski', 'Attaquant', 'FC Barcelona', 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400&h=300&fit=crop', 3800, 'Pologne', 36, 29, 'down', now(), now()),
  ('raphinha-2025', 'raphinha-dias', 'Raphinha', 'Ailier', 'FC Barcelona', 'https://images.unsplash.com/photo-1526569711659-ae0b5e61d22d?w=400&h=300&fit=crop', 3500, 'Brésil', 28, 30, 'stable', now(), now())

ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  position = EXCLUDED.position,
  club = EXCLUDED.club,
  photo = EXCLUDED.photo,
  votes = EXCLUDED.votes,
  country = EXCLUDED.country,
  age = EXCLUDED.age,
  ranking = EXCLUDED.ranking,
  trend = EXCLUDED.trend,
  updated_at = now();