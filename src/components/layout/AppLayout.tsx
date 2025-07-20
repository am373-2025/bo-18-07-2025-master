import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

export function AppLayout() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Suspense 
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner size="lg" text="Chargement de l'application..." />
            </div>
          }
        >
          <main className="pb-20">
            <Outlet />
          </main>
        </Suspense>
        
        <BottomNavigation />
        
        {/* Toast notifications */}
        <Toaster />
        <Sonner />
      </div>
    </ErrorBoundary>
  );
}