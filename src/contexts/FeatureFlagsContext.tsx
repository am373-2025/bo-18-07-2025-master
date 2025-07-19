import React, { createContext, useContext, useState, useEffect } from 'react';

export interface FeatureFlags {
  showChat: boolean;
  showLegends: boolean;
  showClub: boolean;
  showRanking: boolean;
  showMyTop: boolean; // Page MyTop
}

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  updateFlag: (flag: keyof FeatureFlags, value: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}

const defaultFlags: FeatureFlags = {
  showChat: true,
  showLegends: true,
  showClub: true,
  showRanking: true,
  showMyTop: true,
};

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
};

export const FeatureFlagsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<FeatureFlags>(() => {
    const saved = localStorage.getItem('featureFlags');
    return saved ? JSON.parse(saved) : defaultFlags;
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('featureFlags', JSON.stringify(flags));
  }, [flags]);

  useEffect(() => {
    localStorage.setItem('isAdmin', isAdmin.toString());
  }, [isAdmin]);

  const updateFlag = (flag: keyof FeatureFlags, value: boolean) => {
    setFlags(prev => ({ ...prev, [flag]: value }));
  };

  return (
    <FeatureFlagsContext.Provider value={{ flags, updateFlag, isAdmin, setIsAdmin }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};