import { useState } from "react";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { SplashScreen } from "@/components/ui/splash-screen";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useFeatureFlags } from "@/contexts/FeatureFlagsContext";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home"));
const Ranking = lazy(() => import("./pages/Ranking"));
const Legends = lazy(() => import("./pages/Legends"));
const Club = lazy(() => import("./pages/Club"));
const Chat = lazy(() => import("./pages/Chat"));
const Profile = lazy(() => import("./pages/Profile"));
const Player = lazy(() => import("./pages/Player"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MyTop = lazy(() => import("./pages/MyTop"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground">Chargement...</p>
    </div>
  </div>
);

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { flags } = useFeatureFlags();

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="relative">
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/ranking" element={<Ranking />} />
                    <Route path="/legends" element={<Legends />} />
                    <Route path="/club" element={<Club />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/player/:slug" element={<Player />} />
                    {flags.showMyTop && <Route path="/mytop" element={<MyTop />} />}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <BottomNavigation />
              </div>
            </BrowserRouter>
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
