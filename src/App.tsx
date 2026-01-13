import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PostHogProvider } from "@/hooks/usePostHog";
import { useEffect } from "react";
import { initPostHog } from "@/lib/posthog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AdminRoute from "@/components/AdminRoute";
import Index from "./pages/Index";
import PlatformOverview from "./pages/PlatformOverview";
import PilotPartner from "./pages/PilotPartner";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignDetails from "./pages/CampaignDetails";
import Jobs from "./pages/Jobs";
import CreateJob from "./pages/CreateJob";
import Settings from "./pages/Settings";
import OrganizationSettings from "./pages/OrganizationSettings";
import MetaConnection from "./pages/MetaConnection";
import TikTokConnection from "./pages/TikTokConnection";
import InviteUsers from "./pages/InviteUsers";
import UserManagement from "./pages/UserManagement";
import AcceptInvite from "./pages/AcceptInvite";
import GoogleAuthCallback from "./pages/GoogleAuthCallback";
import TopUp from "./pages/TopUp";
import TopUpSuccess from "./pages/TopUpSuccess";
import NotFound from "./pages/NotFound";
import AuthRecoveryListener from "@/components/AuthRecoveryListener";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    initPostHog();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <PostHogProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthRecoveryListener />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/platform-overview" element={<PlatformOverview />} />
                <Route path="/pilot-program" element={<PilotPartner />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/dashboard"
                  element={
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/campaigns"
                  element={
                    <DashboardLayout>
                      <Campaigns />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/campaigns/create"
                  element={
                    <DashboardLayout>
                      <CreateCampaign />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/campaigns/:id"
                  element={
                    <DashboardLayout>
                      <CampaignDetails />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/jobs"
                  element={
                    <DashboardLayout>
                      <Jobs />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/jobs/create"
                  element={
                    <DashboardLayout>
                      <CreateJob />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <DashboardLayout>
                      <Settings />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/settings/organization"
                  element={
                    <DashboardLayout>
                      <OrganizationSettings />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/meta-connection"
                  element={
                    <DashboardLayout>
                      <AdminRoute>
                        <MetaConnection />
                      </AdminRoute>
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/tiktok-connection"
                  element={
                    <DashboardLayout>
                      <AdminRoute>
                        <TikTokConnection />
                      </AdminRoute>
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/invite-users"
                  element={
                    <DashboardLayout>
                      <AdminRoute>
                        <InviteUsers />
                      </AdminRoute>
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/users/:userId"
                  element={
                    <DashboardLayout>
                      <AdminRoute>
                        <UserManagement />
                      </AdminRoute>
                    </DashboardLayout>
                  }
                />
                <Route path="/accept-invite" element={<AcceptInvite />} />
                <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
                <Route path="/top-up" element={<TopUp />} />
                <Route path="/top-up/success" element={<TopUpSuccess />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </PostHogProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
