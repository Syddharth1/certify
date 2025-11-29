import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import Templates from "./pages/Templates";
import Auth from "./pages/Auth";
import Verify from "./pages/Verify";
import Certificate from "./pages/Certificate";
import NotFound from "./pages/NotFound";
import UserDashboard from "./pages/UserDashboard";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  // Preload critical fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/editor" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/certificate/:verificationId" element={<Certificate />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);
};

export default App;
