"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type EmailLoginFormProps = {
  next?: string;
};

export function EmailLoginForm({ next = "/editor" }: EmailLoginFormProps) {
  const [email, setEmail] = useState("premium@ed-ia.app");
  const [password, setPassword] = useState("EdiaPremium2026!");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!isSupabaseConfigured()) {
      setError("Supabase no está configurado. Revisa .env.local");
      return;
    }

    setPending(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setPending(false);
        return;
      }

      window.location.assign(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo iniciar sesión");
      setPending(false);
    }
  }

  return (
    <form onSubmit={signIn} className="space-y-3">
      <label className="block">
        <span className="font-mono text-[10px] tracking-[0.28em] text-ghost">EMAIL</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 h-11 w-full border border-line bg-void px-3 font-mono text-xs text-white outline-none focus:border-white/40"
          autoComplete="username"
          required
        />
      </label>
      <label className="block">
        <span className="font-mono text-[10px] tracking-[0.28em] text-ghost">PASSWORD</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 h-11 w-full border border-line bg-void px-3 font-mono text-xs text-white outline-none focus:border-white/40"
          autoComplete="current-password"
          required
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center gap-3 bg-white px-5 font-mono text-[11px] tracking-[0.22em] text-black uppercase transition-colors disabled:opacity-50"
      >
        {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
        Entrar premium
      </button>
      {error ? (
        <p className="font-mono text-[10px] leading-5 tracking-wide text-signal">ERR // {error}</p>
      ) : null}
    </form>
  );
}
