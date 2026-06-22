import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { PostHogProvider } from "@/hooks/usePostHog";
import { useEffect } from "react";
import { initPostHog } from "@/lib/posthog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AdminRoute from "@/components/AdminRoute";
import Index from "./pages/Index";
import PlatformOverview from "./pages/PlatformOverview";
import PilotPartner from "./pages/PilotPartner";
import BecomePartner from "./pages/BecomePartner";
import Solution from "./pages/Solution";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Pricing from "./pages/Pricing";
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
import StatusPage from "./pages/StatusPage";
import MetaConnection from "./pages/MetaConnection";
import TikTokConnection from "./pages/TikTokConnection";
import InviteUsers from "./pages/InviteUsers";
import UserManagement from "./pages/UserManagement";
import Companies from "./pages/Companies";

import GoogleAuthCallback from "./pages/GoogleAuthCallback";
import TopUp from "./pages/TopUp";
import TopUpSuccess from "./pages/TopUpSuccess";
import NotFound from "./pages/NotFound";
import MetaJobAds from "./pages/MetaJobAds";
import TikTokJobAds from "./pages/TikTokJobAds";
import AIAgents from "./pages/AIAgents";
import AuthRecoveryListener from "@/components/AuthRecoveryListener";
import ScrollToTop from "@/components/ScrollToTop";

const queryClient = new QueryClient();

const HomeRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen page-bg" />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Index />;
};

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
              <ScrollToTop />
              <AuthRecoveryListener />
              <Routes>
                <Route path="/" element={<HomeRoute />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/platform-overview" element={<PlatformOverview />} />
                <Route path="/solution" element={<Solution />} />
                <Route path="/pilot-program" element={<PilotPartner />} />
                <Route path="/become-partner" element={<BecomePartner />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/meta-job-ads" element={<MetaJobAds />} />
                <Route path="/tiktok-job-ads" element={<TikTokJobAds />} />
                <Route path="/nl/ai-agents" element={<AIAgents lang="nl" />} />
                <Route path="/en/ai-agents" element={<AIAgents lang="en" />} />
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
                  path="/settings/status"
                  element={
                    <DashboardLayout>
                      <StatusPage />
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
                <Route
                  path="/companies"
                  element={
                    <DashboardLayout>
                      <AdminRoute>
                        <Companies />
                      </AdminRoute>
                    </DashboardLayout>
                  }
                />
                
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
