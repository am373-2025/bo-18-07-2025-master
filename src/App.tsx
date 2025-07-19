import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { SplashScreen } from "@/components/ui/splash-screen";
import { ThemeProvider } from "next-themes";
import Home from "./pages/Home";
import Ranking from "./pages/Ranking";
import Legends from "./pages/Legends";
import Club from "./pages/Club";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Player from "./pages/Player";
import NotFound from "./pages/NotFound";
import MyTop from "./pages/MyTop";
import { useFeatureFlags } from "@/contexts/FeatureFlagsContext";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { flags } = useFeatureFlags();

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="relative">
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
              <BottomNavigation />
            </div>
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
