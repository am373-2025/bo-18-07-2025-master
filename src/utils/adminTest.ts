// Utilitaire pour créer un compte admin de test
export const createTestAdmin = () => {
  // Activer le mode admin dans localStorage
  localStorage.setItem('isAdmin', 'true');
  
  // Créer un profil admin de test
  const adminProfile = {
    id: 'admin-test-001',
    name: 'Admin Test',
    email: 'admin@ballondor.test',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isAdmin: true,
    permissions: ['feature_flags', 'user_management', 'content_moderation'],
    createdAt: new Date().toISOString()
  };
  
  localStorage.setItem('adminProfile', JSON.stringify(adminProfile));
  
  // Définir les feature flags par défaut
  const defaultFeatureFlags = {
    showChat: true,
    showPolls: true,
    showLegends: true,
    showClub: true,
    showRanking: true,
    showComments: true,
    showLikes: true,
    showSharing: true,
    showNotifications: true,
    showSearch: true,
    showMyTop: true,
    showSwipe: true,
    showReels: true,
    showCountdown: true,
    showPopularTops: true,
  };
  
  localStorage.setItem('featureFlags', JSON.stringify(defaultFeatureFlags));
  
  // Retourner les informations du compte créé
  return {
    profile: adminProfile,
    message: 'Compte admin de test créé avec succès',
    credentials: {
      email: 'admin@ballondor.test',
      password: 'admin123'
    }
  };
};

// Fonction pour vérifier si l'utilisateur actuel est admin
export const isCurrentUserAdmin = (): boolean => {
  return localStorage.getItem('isAdmin') === 'true';
};

// Fonction pour récupérer le profil admin
export const getAdminProfile = () => {
  const profile = localStorage.getItem('adminProfile');
  return profile ? JSON.parse(profile) : null;
};

// Fonction pour désactiver le mode admin (logout)
export const logoutAdmin = () => {
  localStorage.setItem('isAdmin', 'false');
  localStorage.removeItem('adminProfile');
};