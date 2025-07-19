import { useFeatureFlags, FeatureFlags } from "@/contexts/FeatureFlagsContext";

interface FeatureFlagWrapperProps {
  flag: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureFlagWrapper = ({ flag, children, fallback = null }: FeatureFlagWrapperProps) => {
  const { flags } = useFeatureFlags();
  
  return flags[flag] ? <>{children}</> : <>{fallback}</>;
};