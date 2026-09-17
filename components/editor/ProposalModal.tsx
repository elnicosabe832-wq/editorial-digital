"use client";

import { Modal } from "@/components/ui/Modal";
import type { EditorialProposal } from "@/lib/editorial";

type ProposalModalProps = {
  open: boolean;
  index: number;
  total: number;
  proposal: EditorialProposal | null;
  summary?: string;
  provider?: string;
  onAccept: () => void;
  onReject: () => void;
  onStop: () => void;
};

const kindLabel: Record<EditorialProposal["kind"], string> = {
  grammar: "GRAMÁTICA",
  style: "ESTILO",
  clarity: "CLARIDAD",
  structure: "ESTRUCTURA",
  voice: "VOZ",
};

export function ProposalModal({
  open,
  index,
  total,
  proposal,
  summary,
  provider,
  onAccept,
  onReject,
  onStop,
}: ProposalModalProps) {
  return (
    <Modal
      open={open}
      title="Propuesta editorial"
      code={`AI/${String(index + 1).padStart(2, "0")}`}
      onClose={onStop}
      className="max-w-2xl"
    >
      {proposal ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-ghost">
            <span className="border border-line px-2 py-1 text-white">
              {index + 1}/{total}
            </span>
            <span className="border border-line px-2 py-1">{kindLabel[proposal.kind]}</span>
            <span
              className={`border px-2 py-1 ${
                proposal.severity === "major" ? "border-signal text-signal" : "border-line"
              }`}
            >
              {proposal.severity === "major" ? "MAJOR" : "MINOR"}
            </span>
            {provider ? <span className="ml-auto uppercase">{provider}</span> : null}
          </div>

          {summary ? (
            <p className="font-mono text-[11px] leading-5 tracking-wide text-ghost">{summary}</p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <section className="border border-line bg-panel p-3">
              <p className="font-mono text-[10px] tracking-[0.28em] text-ghost">ORIGINAL</p>
              <p className="mt-2 text-sm leading-6 text-white/80">{proposal.original}</p>
            </section>
            <section className="border border-signal/40 bg-panel p-3">
              <p className="font-mono text-[10px] tracking-[0.28em] text-signal">PROPUESTA</p>
              <p className="mt-2 text-sm leading-6 text-white">{proposal.proposed}</p>
            </section>
          </div>

          <p className="text-sm leading-6 text-ghost">{proposal.reason}</p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onAccept}
              className="h-10 flex-1 bg-white px-4 font-mono text-[10px] tracking-[0.2em] text-black uppercase"
            >
              Aceptar
            </button>
            <button
              type="button"
              onClick={onReject}
              className="h-10 flex-1 border border-line px-4 font-mono text-[10px] tracking-[0.2em] uppercase text-ghost hover:text-white"
            >
              Rechazar
            </button>
            <button
              type="button"
              onClick={onStop}
              className="h-10 border border-line px-4 font-mono text-[10px] tracking-[0.2em] uppercase text-ghost hover:text-white"
            >
              Detener
            </button>
          </div>
          <p className="font-mono text-[10px] tracking-wide text-ghost">
            Puedes seguir escribiendo en el lienzo en cualquier momento.
          </p>
        </div>
      ) : null}
    </Modal>
  );
}
