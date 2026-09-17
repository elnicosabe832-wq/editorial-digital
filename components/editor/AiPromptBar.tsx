"use client";

import { useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";

type AiPromptBarProps = {
  disabled: boolean;
  running: boolean;
  lockedMessage?: string;
  onRun: (prompt?: string) => void;
};

export function AiPromptBar({ disabled, running, lockedMessage, onRun }: AiPromptBarProps) {
  const [prompt, setPrompt] = useState("");

  return (
    <form
      className="mt-4 border border-line bg-panel p-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (disabled || running) return;
        onRun(prompt.trim() || undefined);
      }}
    >
      <p className="font-mono text-[10px] tracking-[0.28em] text-ghost">05 / IA EDITORIAL</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          disabled={disabled || running}
          placeholder="Pide un cambio: tono más íntimo, corta el capítulo 1, corrige ritmo…"
          className="h-11 min-w-0 flex-1 border border-line bg-void px-3 text-sm text-white outline-none placeholder:text-ghost disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={disabled || running}
          className="inline-flex h-11 items-center justify-center gap-2 bg-white px-4 font-mono text-[10px] tracking-[0.2em] text-black uppercase disabled:opacity-40"
        >
          {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {running ? "Analizando" : "Enviar"}
        </button>
      </div>
      {lockedMessage ? (
        <p className="mt-2 font-mono text-[10px] tracking-wide text-signal">{lockedMessage}</p>
      ) : (
        <p className="mt-2 font-mono text-[10px] tracking-wide text-ghost">
          Vacío = pasada editorial completa según el modo del sidebar.
        </p>
      )}
    </form>
  );
}
