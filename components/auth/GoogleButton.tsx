"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type GoogleButtonProps = {
  next?: string;
  label?: string;
  variant?: "solid" | "ghost";
};

export function GoogleButton({
  next = "/editor",
  label = "Entrar con Google",
  variant = "solid",
}: GoogleButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setError(null);

    if (!isSupabaseConfigured()) {
      setError("Supabase no está configurado. Revisa .env.local");
      return;
    }

    setPending(true);

    try {
      const supabase = createClient();
      const origin = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (oauthError) {
        setError(
          oauthError.message.includes("provider")
            ? "Activa Google en Supabase Auth → Providers y pega el Client ID de Google Cloud."
            : oauthError.message,
        );
        setPending(false);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo iniciar sesión");
      setPending(false);
    }
  }

  const classes =
    variant === "solid"
      ? "bg-white text-black hover:bg-paper"
      : "border border-line bg-transparent text-white hover:border-white/40";

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={signIn}
        disabled={pending}
        className={`inline-flex h-11 items-center justify-center gap-3 px-5 font-mono text-[11px] tracking-[0.22em] uppercase transition-colors disabled:opacity-50 ${classes}`}
      >
        {pending ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <span className="inline-flex h-4 w-4 items-center justify-center border border-current text-[9px]">
            G
          </span>
        )}
        {label}
      </button>
      {error ? (
        <p className="max-w-sm font-mono text-[10px] leading-5 tracking-wide text-signal">
          ERR // {error}
        </p>
      ) : null}
    </div>
  );
}
