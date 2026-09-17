import Link from "next/link";
import { redirect } from "next/navigation";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { EmailLoginForm } from "@/components/auth/EmailLoginForm";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/editor");
  }

  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-void px-4">
      <div className="w-full max-w-md border border-line bg-panel">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <p className="font-mono text-[10px] tracking-[0.32em] text-ghost">AUTH / PREMIUM</p>
          <span className="h-2 w-2 bg-signal" />
        </div>
        <div className="space-y-6 p-6">
          <div>
            <h1 className="font-mono text-2xl tracking-[0.08em]">ED/IA</h1>
            <p className="mt-2 text-sm leading-6 text-ghost">
              Cuenta de prueba Premium: <span className="text-white">premium@ed-ia.app</span>
              {" / "}
              <span className="text-white">EdiaPremium2026!</span>.
              El lienzo de escritura sigue siendo gratis sin cuenta.
            </p>
          </div>
          {error ? (
            <p className="border border-signal px-3 py-2 font-mono text-[11px] text-signal">
              ERR // No se pudo completar el OAuth. Revisa el proveedor Google en Supabase.
            </p>
          ) : null}
          <EmailLoginForm next="/editor" />
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="font-mono text-[10px] tracking-[0.22em] text-ghost">O</span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <GoogleButton next="/editor" label="Continuar con Google" variant="ghost" />
          <Link
            href="/editor"
            className="block text-center font-mono text-[10px] tracking-[0.22em] text-ghost uppercase hover:text-white"
          >
            Seguir escribiendo sin cuenta
          </Link>
        </div>
      </div>
    </main>
  );
}
