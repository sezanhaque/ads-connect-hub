import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignDetails from "./pages/CampaignDetails";
import Jobs from "./pages/Jobs";
import CreateJob from "./pages/CreateJob";
import Settings from "./pages/Settings";
import OrganizationSettings from "./pages/OrganizationSettings";
import MetaConnection from "./pages/MetaConnection";
import InviteUsers from "./pages/InviteUsers";
import AcceptInvite from "./pages/AcceptInvite";
import GoogleAuthCallback from "./pages/GoogleAuthCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
            <Route path="/campaigns" element={<DashboardLayout><Campaigns /></DashboardLayout>} />
            <Route path="/campaigns/create" element={<DashboardLayout><CreateCampaign /></DashboardLayout>} />
            <Route path="/campaigns/:id" element={<DashboardLayout><CampaignDetails /></DashboardLayout>} />
            <Route path="/jobs" element={<DashboardLayout><Jobs /></DashboardLayout>} />
            <Route path="/jobs/create" element={<DashboardLayout><CreateJob /></DashboardLayout>} />
            <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
            <Route path="/settings/organization" element={<DashboardLayout><OrganizationSettings /></DashboardLayout>} />
            <Route path="/meta-connection" element={<DashboardLayout><MetaConnection /></DashboardLayout>} />
            <Route path="/invite-users" element={<DashboardLayout><InviteUsers /></DashboardLayout>} />
            <Route path="/accept-invite" element={<AcceptInvite />} />
            <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;