import { useCallback } from 'react';
import { useDatabase } from './useDatabase';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { UserVote, UserFavorite } from '@/types/database';

export function usePlayerActions() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [, voteActions] = useDatabase('user_votes');
  const [, favoriteActions] = useDatabase('user_favorites');
  const [, playerActions] = useDatabase('players');

  const voteForPlayer = useCallback(async (playerId: string, playerName: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour voter",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Vérifier si déjà voté
      const existingVotes = JSON.parse(localStorage.getItem('ballondor_user_votes') || '[]');
      const hasVoted = existingVotes.some((vote: UserVote) => 
        vote.user_id === user.id && vote.player_id === playerId
      );

      if (hasVoted) {
        toast({
          title: "Déjà voté",
          description: "Vous avez déjà voté pour ce joueur",
          variant: "destructive"
        });
        return false;
      }

      // Enregistrer le vote
      await voteActions.create({
        user_id: user.id,
        player_id: playerId,
        player_name: playerName
      });

      // Incrémenter les votes du joueur
      const playersData = JSON.parse(localStorage.getItem('ballondor_players') || '[]');
      const updatedPlayers = playersData.map((p: any) => 
        p.id === playerId ? { ...p, votes: (p.votes || 0) + 1 } : p
      );
      localStorage.setItem('ballondor_players', JSON.stringify(updatedPlayers));

      toast({
        title: "Vote enregistré !",
        description: `Vous avez voté pour ${playerName}`,
      });

      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre vote",
        variant: "destructive"
      });
      return false;
    }
  }, [user, voteActions, toast]);

  const toggleFavorite = useCallback(async (playerId: string, playerName: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour gérer vos favoris",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Vérifier si déjà en favoris
      const existingFavorites = JSON.parse(localStorage.getItem('ballondor_user_favorites') || '[]');
      const existingFavorite = existingFavorites.find((fav: UserFavorite) => 
        fav.user_id === user.id && fav.player_id === playerId
      );

      if (existingFavorite) {
        // Retirer des favoris
        await favoriteActions.remove(existingFavorite.id);
        toast({
          title: "Retiré des favoris",
          description: `${playerName} retiré de vos favoris`
        });
        return false;
      } else {
        // Ajouter aux favoris
        await favoriteActions.create({
          user_id: user.id,
          player_id: playerId,
          player_name: playerName
        });
        toast({
          title: "Ajouté aux favoris",
          description: `${playerName} ajouté à vos favoris`
        });
        return true;
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier vos favoris",
        variant: "destructive"
      });
      return false;
    }
  }, [user, favoriteActions, toast]);

  return {
    voteForPlayer,
    toggleFavorite
  };
}