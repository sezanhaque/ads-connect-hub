import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface MetaIntegration {
  id: string;
  org_id: string;
  ad_account_id: string[] | null;
  account_name: string | null;
  status: "active" | "expired" | "error";
  last_sync_at: string | null;
  created_at: string;
}

export const useMetaIntegrationStatus = () => {
  const { user } = useAuth();
  const [integration, setIntegration] = useState<MetaIntegration | null>(null);
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

      // App admins see the global shared connection status
      const { data: isAdmin } = await supabase.rpc("is_app_admin", { p_user_id: user.id });

      let metaQuery = supabase
        .from("integrations")
        .select("*")
        .eq("integration_type", "meta")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1);

      if (!isAdmin) {
        // Non-admins: scope to their company's members' org_ids
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

        const { data: orgRows } = await supabase
          .from("members")
          .select("org_id")
          .in("user_id", userIds);

        const orgIds = Array.from(new Set((orgRows || []).map((r: any) => r.org_id)));
        if (orgIds.length === 0) {
          setIntegration(null);
          return;
        }
        metaQuery = metaQuery.in("org_id", orgIds);
      }

      const { data: metaIntegration, error: integrationError } = await metaQuery.maybeSingle();

      if (integrationError) {
        console.error("Integration fetch error:", integrationError);
        throw new Error("Failed to fetch integration status");
      }

      setIntegration(metaIntegration as MetaIntegration);
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
      const { error } = await supabase.from("integrations").update({ status: "error" }).eq("id", integration.id);

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
