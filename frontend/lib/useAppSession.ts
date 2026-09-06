"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";
import { apiGet } from "./api";
import type { CompanyProfile } from "@/types/analysis";

export function useAppSession() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        setLoading(false);
        router.replace("/login");
        return;
      }

      setSession(data.session);
      try {
        const response = await apiGet("/api/auth/me");
        if (mounted) setProfile(response.profile || null);
      } catch {
        // Authentication is still valid even when the optional profile is unavailable.
      } finally {
        if (mounted) setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (!nextSession) router.replace("/login");
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  return { session, profile, setProfile, loading };
}
