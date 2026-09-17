import Link from "next/link";
import { GlyphGrid } from "@/components/ui/GlyphGrid";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-void text-white">
      <div className="technical-grid pointer-events-none absolute inset-0 opacity-50" />

      <header className="relative flex items-center justify-between border-b border-line px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 bg-signal" />
          <span className="font-mono text-[11px] tracking-[0.32em]">ED/IA</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px] tracking-[0.22em] text-ghost">
          <span>SYS.OK</span>
          <span>14D TRIAL</span>
          <Link href="/login" className="text-white hover:text-signal">
            LOGIN
          </Link>
        </div>
      </header>

      <main className="relative mx-auto flex min-h-[calc(100vh-57px)] w-full max-w-5xl flex-col justify-center px-5 py-16">
        <p className="font-mono text-[11px] tracking-[0.34em] text-ghost">
          00 / EDITORIAL DIGITAL
        </p>
        <h1 className="mt-6 max-w-3xl font-mono text-4xl leading-tight tracking-[-0.04em] sm:text-6xl">
          ESCRIBE.
          <br />
          EDITA.
          <span className="text-signal"> PUBLICA.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-ghost">
          Lienzo minimalista estilo Word/Notion. Escribe gratis, sube tu
          manuscrito o entra Premium y lanza la IA editorial (Supervisor o Autopilot).
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-start">
          <Link
            href="/editor"
            className="inline-flex h-11 items-center justify-center bg-white px-6 font-mono text-[11px] tracking-[0.22em] text-black uppercase"
          >
            Escribir gratis
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center border border-line px-6 font-mono text-[11px] tracking-[0.22em] text-white uppercase hover:border-white/40"
          >
            Probar IA premium
          </Link>
        </div>

        <div className="mt-16 grid gap-px border border-line bg-line sm:grid-cols-3">
          {[
            ["01", "CANVAS LIBRE", "Escribe o importa .docx / .txt / .pdf"],
            ["02", "IA EDITORIAL", "Supervisor o Autopilot. Tú confirmas."],
            ["03", "KDP READY", "PDF, ePub y cover en sprints posteriores"],
          ].map(([code, title, copy]) => (
            <article key={code} className="bg-void p-5">
              <p className="font-mono text-[10px] tracking-[0.28em] text-signal">{code}</p>
              <h2 className="mt-3 font-mono text-sm tracking-[0.16em]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-ghost">{copy}</p>
              <GlyphGrid className="mt-6 w-24" cols={8} rows={2} />
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
