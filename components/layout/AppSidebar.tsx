"use client";

import { FileUp, Lock, PenLine, Plus, Sparkles, LoaderCircle } from "lucide-react";
import { GlyphGrid } from "@/components/ui/GlyphGrid";
import type { CreationMode } from "@/lib/settings";
import type { TrialState } from "@/lib/trial";

type AppSidebarProps = {
  open: boolean;
  wordCount: number;
  charCount: number;
  savingLabel: string;
  mode: CreationMode;
  premiumUnlocked: boolean;
  trial: TrialState;
  onNew: () => void;
  onLoadSample: () => void;
  onImportClick: () => void;
  onModeChange: (mode: CreationMode) => void;
  onRunAi: () => void;
  aiRunning?: boolean;
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-panel p-3">
      <p className="font-mono text-[9px] tracking-[0.32em] text-ghost">{label}</p>
      <p className="mt-2 font-mono text-2xl tabular-nums tracking-[0.18em]">{value}</p>
      <div className="dot-matrix mt-3 h-7 border border-white/5" />
    </div>
  );
}

export function AppSidebar({
  open,
  wordCount,
  charCount,
  savingLabel,
  mode,
  premiumUnlocked,
  trial,
  onNew,
  onLoadSample,
  onImportClick,
  onModeChange,
  onRunAi,
  aiRunning = false,
}: AppSidebarProps) {
  const pages = Math.max(1, Math.ceil(wordCount / 250));

  return (
    <aside
      className={`fixed inset-y-12 left-0 z-30 w-[272px] border-r border-line bg-void transition-transform lg:static lg:inset-auto lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-[calc(100vh-3rem)] flex-col overflow-y-auto">
        <section className="border-b border-line p-4">
          <p className="font-mono text-[10px] tracking-[0.32em] text-ghost">01 / DOCUMENTO</p>
          <div className="mt-3 grid gap-2">
            <button
              type="button"
              onClick={onNew}
              className="inline-flex h-10 items-center gap-2 border border-line px-3 font-mono text-[10px] tracking-[0.2em] uppercase hover:border-white/40"
            >
              <Plus className="h-3.5 w-3.5" />
              Nuevo manuscrito
            </button>
            <button
              type="button"
              onClick={onImportClick}
              className="inline-flex h-10 items-center gap-2 border border-line px-3 font-mono text-[10px] tracking-[0.2em] uppercase hover:border-white/40"
            >
              <FileUp className="h-3.5 w-3.5" />
              Importar archivo
            </button>
            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex h-10 items-center gap-2 border border-line px-3 font-mono text-[10px] tracking-[0.2em] uppercase hover:border-white/40"
            >
              <PenLine className="h-3.5 w-3.5" />
              Cargar muestra
            </button>
          </div>
        </section>

        <section className="border-b border-line p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.32em] text-ghost">02 / MÉTRICAS</p>
            <GlyphGrid cols={6} rows={1} />
          </div>
          <div className="grid gap-2">
            <Metric label="WORDS" value={String(wordCount).padStart(4, "0")} />
            <Metric label="CHARS" value={String(charCount).padStart(4, "0")} />
            <Metric label="PAGES ~" value={String(pages).padStart(2, "0")} />
          </div>
          <p className="mt-3 font-mono text-[10px] tracking-[0.18em] text-ghost">{savingLabel}</p>
        </section>

        <section className="border-b border-line p-4">
          <p className="font-mono text-[10px] tracking-[0.32em] text-ghost">03 / MODO</p>
          <div className="mt-3 grid gap-2">
            {(
              [
                ["supervisor", "Supervisor editorial"],
                ["autopilot", "Autopilot"],
              ] as const
            ).map(([value, label]) => {
              const active = mode === value;
              const locked = !premiumUnlocked;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onModeChange(value)}
                  className={`flex h-11 items-center justify-between border px-3 font-mono text-[10px] tracking-[0.16em] uppercase ${
                    active ? "border-signal text-white" : "border-line text-ghost"
                  }`}
                >
                  {label}
                  {locked ? <Lock className="h-3.5 w-3.5 text-signal" /> : <span className="h-1.5 w-1.5 bg-signal" />}
                </button>
              );
            })}
          </div>
          <p className="mt-3 font-mono text-[10px] leading-5 tracking-wide text-ghost">
            {premiumUnlocked
              ? "Supervisor confirma cada cambio mayor. Autopilot aplica según el nivel (alto/medio/bajo)."
              : trial.plan === "guest"
                ? "Entra con la cuenta Premium para lanzar la IA editorial."
                : "Trial agotado. El lienzo sigue siendo gratis."}
          </p>
          <button
            type="button"
            onClick={onRunAi}
            disabled={!premiumUnlocked || aiRunning}
            className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 bg-white px-3 font-mono text-[10px] tracking-[0.18em] text-black uppercase disabled:opacity-30"
          >
            {aiRunning ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {aiRunning ? "Analizando" : "Ejecutar IA"}
          </button>
        </section>

        <div className="mt-auto border-t border-line p-4">
          <p className="font-mono text-[10px] tracking-[0.32em] text-ghost">SYS.STATUS</p>
          <div className="mt-2 flex items-center gap-2 font-mono text-[11px] tracking-[0.16em]">
            <span className="h-2 w-2 bg-signal" />
            CANVAS // ONLINE
          </div>
          <p className="mt-2 font-mono text-[10px] tracking-[0.16em] text-ghost">EDITORIAL // ED/IA</p>
        </div>
      </div>
    </aside>
  );
}
