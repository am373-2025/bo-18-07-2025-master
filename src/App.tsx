import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { FeatureFlagsProvider } from "@/contexts/FeatureFlagsContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { SplashScreen } from "@/components/ui/splash-screen";
import { useState, useEffect } from "react";

// Lazy loading des pages pour optimiser les performances
const Home = lazy(() => import("./pages/Home"));
const Ranking = lazy(() => import("./pages/Ranking"));
const Legends = lazy(() => import("./pages/Legends"));
const Club = lazy(() => import("./pages/Club"));
const Chat = lazy(() => import("./pages/Chat"));
const Profile = lazy(() => import("./pages/Profile"));
const Player = lazy(() => import("./pages/Player"));
const MyTop = lazy(() => import("./pages/MyTop"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Simuler le chargement initial de l'app
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash && !appReady) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <FeatureFlagsProvider>
            <AuthProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<AppLayout />}>
                    <Route index element={<Home />} />
                    <Route path="ranking" element={<Ranking />} />
                    <Route path="legends" element={<Legends />} />
                    <Route path="club" element={<Club />} />
                    <Route path="chat" element={<Chat />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="player/:slug" element={<Player />} />
                    <Route path="mytop" element={<MyTop />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </AuthProvider>
          </FeatureFlagsProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;