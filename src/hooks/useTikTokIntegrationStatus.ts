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

      // Find the user's company
      const { data: myMembership } = await supabase
        .from("company_members")
        .select("company_id")
        .eq("user_id", user.id)
        .maybeSingle();

      let userIds: string[] = [user.id];
      if (myMembership?.company_id) {
        const { data: companyMembers } = await supabase
          .from("company_members")
          .select("user_id")
          .eq("company_id", myMembership.company_id);
        if (companyMembers && companyMembers.length > 0) {
          userIds = companyMembers.map((m: any) => m.user_id);
        }
      }

      // Collect all org_ids tied to those users
      const { data: orgRows } = await supabase
        .from("members")
        .select("org_id")
        .in("user_id", userIds);

      const orgIds = Array.from(new Set((orgRows || []).map((r: any) => r.org_id)));
      if (orgIds.length === 0) {
        setIntegration(null);
        return;
      }

      // Any active TikTok integration across the company counts as connected
      const { data: tiktokIntegration, error: integrationError } = await supabase
        .from("integrations")
        .select("*")
        .in("org_id", orgIds)
        .eq("integration_type", "tiktok")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

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
