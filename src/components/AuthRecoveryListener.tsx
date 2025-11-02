import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Listens for Supabase PASSWORD_RECOVERY events and ensures we land on /reset-password
export default function AuthRecoveryListener() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1) If the current URL contains a Supabase recovery hash, force navigation to /reset-password
    //    Preserve the hash so the Supabase client can parse tokens reliably.
    if (typeof window !== "undefined") {
      const hash = window.location.hash || "";
      if (hash.includes("type=recovery") && location.pathname !== "/reset-password") {
        navigate(`/reset-password${hash}`, { replace: true });
        return;
      }
    }

    // 2) Subscribe to auth state changes and redirect on PASSWORD_RECOVERY just in case
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && location.pathname !== "/reset-password") {
        // Keep the existing hash if present
        const hash = typeof window !== "undefined" ? window.location.hash : "";
        navigate(`/reset-password${hash}`, { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [location.pathname, navigate]);

  return null;
}
