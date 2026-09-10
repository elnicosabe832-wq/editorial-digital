"use client";

import Link from "next/link";
import { Menu, Settings, X } from "lucide-react";
import { TrialMeter } from "@/components/auth/TrialMeter";
import type { TrialState } from "@/lib/trial";

type AppHeaderProps = {
  title: string;
  onTitleChange: (value: string) => void;
  trial: TrialState;
  signedIn: boolean;
  userLabel?: string | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
};

export function AppHeader({
  title,
  onTitleChange,
  trial,
  signedIn,
  userLabel,
  sidebarOpen,
  onToggleSidebar,
  onOpenSettings,
}: AppHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-line bg-void px-3">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="border border-line p-2 text-ghost hover:text-white lg:hidden"
        aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      <Link href="/" className="hidden items-center gap-2 sm:flex">
        <span className="h-2 w-2 bg-signal" />
        <span className="font-mono text-[11px] tracking-[0.28em]">ED/IA</span>
      </Link>

      <div className="hidden h-4 w-px bg-line sm:block" />

      <input
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent font-mono text-xs tracking-[0.12em] text-white outline-none placeholder:text-ghost"
        placeholder="SIN TÍTULO"
      />

      <TrialMeter state={trial} />

      {signedIn ? (
        <span className="hidden max-w-[140px] truncate font-mono text-[10px] tracking-[0.14em] text-ghost md:inline">
          {userLabel}
        </span>
      ) : (
        <Link
          href="/login"
          className="hidden border border-line px-2 py-1 font-mono text-[10px] tracking-[0.18em] text-white hover:border-white/40 md:inline"
        >
          LOGIN
        </Link>
      )}

      <button
        type="button"
        onClick={onOpenSettings}
        className="border border-line p-2 text-ghost hover:text-white"
        aria-label="Configuración"
      >
        <Settings className="h-4 w-4" />
      </button>
    </header>
  );
}
