import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export function usePlayerActions() {
  const { user } = useAuth();
  const { toast } = useToast();
  

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
      // Vérifier si déjà voté dans localStorage
      const existingVotes = JSON.parse(localStorage.getItem('userVotes') || '[]');
      const hasVoted = existingVotes.some((vote: any) => 
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

      // Enregistrer le vote dans localStorage
      existingVotes.push({ 
        user_id: user.id, 
        player_id: playerId, 
        player_name: playerName, 
        created_at: new Date().toISOString() 
      });
      localStorage.setItem('userVotes', JSON.stringify(existingVotes));

      // Incrémenter les votes du joueur dans localStorage
      const playersData = JSON.parse(localStorage.getItem('table_players') || '[]');
      const updatedPlayers = playersData.map((p: any) => 
        p.id === playerId ? { ...p, votes: (p.votes || 0) + 1 } : p
      );
      localStorage.setItem('table_players', JSON.stringify(updatedPlayers));

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
      // Vérifier si déjà en favoris dans localStorage
      const existingFavorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
      const existingFavorite = existingFavorites.find((fav: any) => 
        fav.user_id === user.id && fav.player_id === playerId
      );

      if (existingFavorite) {
        // Retirer des favoris dans localStorage
        const updated = existingFavorites.filter((fav: any) => 
          !(fav.user_id === user.id && fav.player_id === playerId)
        );
        localStorage.setItem('userFavorites', JSON.stringify(updated));
        toast({
          title: "Retiré des favoris",
          description: `${playerName} retiré de vos favoris`
        });
        return false;
      } else {
        // Ajouter aux favoris dans localStorage
        existingFavorites.push({
          user_id: user.id,
          player_id: playerId,
          player_name: playerName,
          created_at: new Date().toISOString()
        });
        localStorage.setItem('userFavorites', JSON.stringify(existingFavorites));
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