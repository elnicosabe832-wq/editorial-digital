"use client";

import dynamic from "next/dynamic";
import type { EditorSession } from "@/components/editor/EditorApp";

const EditorApp = dynamic(
  () => import("@/components/editor/EditorApp").then((mod) => mod.EditorApp),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-void">
        <p className="font-mono text-xs tracking-[0.28em] text-ghost">BOOTING ED/IA…</p>
      </div>
    ),
  },
);

export function EditorShell(props: EditorSession) {
  return <EditorApp {...props} />;
}
