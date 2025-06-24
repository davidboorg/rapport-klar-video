
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Projects from "./pages/Projects";
import ProjectEditor from "./pages/ProjectEditor";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Templates from "./pages/Templates";
import Avatars from "./pages/Avatars";
import AvatarSetup from "./pages/AvatarSetup";
import NotFound from "./pages/NotFound";
import MarketSelection from "./pages/MarketSelection";
import IRDashboard from "./pages/IRDashboard";
import BoardDashboard from "./pages/BoardDashboard";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/market-selection" element={<MarketSelection />} />
              <Route path="/ir-dashboard" element={<IRDashboard />} />
              <Route path="/board-dashboard" element={<BoardDashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:projectId" element={<ProjectEditor />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/avatars/create" element={<AvatarSetup />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
