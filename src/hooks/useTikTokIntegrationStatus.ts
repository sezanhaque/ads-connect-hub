import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface TikTokIntegration {
  id: string;
  org_id: string;
  ad_account_id: string[] | null;
  account_name: string | null;
  status: "active" | "expired" | "error";
  last_sync_at: string | null;
  created_at: string;
}

export const useTikTokIntegrationStatus = () => {
  const { user } = useAuth();
  const [integration, setIntegration] = useState<TikTokIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegration = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get user's organization - prioritize owner role first
      const { data: memberships, error: membershipsError } = await supabase
        .from("members")
        .select("org_id, role")
        .eq("user_id", user.id)
        .order("role", { ascending: true });

      if (membershipsError) {
        throw new Error("Failed to get user organization");
      }

      if (!memberships || memberships.length === 0) {
        console.log("No organizations found for user");
        setIntegration(null);
        return;
      }

      // Find organization with highest role
      let primaryOrg =
        memberships.find((m: any) => m.role === "owner") ||
        memberships.find((m: any) => m.role === "admin") ||
        memberships.find((m: any) => m.role === "member") ||
        memberships[0];

      // Check for user-specific TikTok integration first, then org-level
      let { data: tiktokIntegration, error: integrationError } = await supabase
        .from("integrations")
        .select("*")
        .eq("org_id", primaryOrg.org_id)
        .eq("integration_type", "tiktok")
        .eq("status", "active")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // If no user-specific integration, check for org-level integration
      if (!tiktokIntegration && !integrationError) {
        const { data: orgIntegration, error: orgError } = await supabase
          .from("integrations")
          .select("*")
          .eq("org_id", primaryOrg.org_id)
          .eq("integration_type", "tiktok")
          .eq("status", "active")
          .is("user_id", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        tiktokIntegration = orgIntegration;
        integrationError = orgError;
      }

      if (integrationError) {
        console.error("Integration fetch error:", integrationError);
        throw new Error("Failed to fetch integration status");
      }

      setIntegration(tiktokIntegration as TikTokIntegration);
    } catch (err: any) {
      console.error("fetchIntegration error:", err);
      setError(err.message);
      setIntegration(null);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    if (!integration) return;

    try {
      const { error } = await supabase
        .from("integrations")
        .update({ status: "error" })
        .eq("id", integration.id);

      if (error) {
        throw new Error("Failed to disconnect integration");
      }

      setIntegration(null);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchIntegration();
  }, [user]);

  return {
    integration,
    loading,
    error,
    isConnected: !!integration,
    refetch: fetchIntegration,
    disconnect,
  };
};