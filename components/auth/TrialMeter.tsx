"use client";

import { useEffect, useState } from "react";
import type { TrialState } from "@/lib/trial";

type TrialMeterProps = {
  state: TrialState;
};

export function TrialMeter({ state }: TrialMeterProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fill =
    state.plan === "premium"
      ? 100
      : state.plan === "trial" && state.daysLeft != null
        ? Math.round((state.daysLeft / 14) * 100)
        : 0;

  if (!mounted) {
    return (
      <span className="border border-line px-2 py-1 font-mono text-[10px] tracking-[0.18em] text-white">
        {state.label}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:block">
        <p className="font-mono text-[9px] tracking-[0.28em] text-ghost">
          {state.label}
        </p>
        <div className="mt-1 flex h-1.5 w-24 gap-px bg-line">
          {Array.from({ length: 14 }).map((_, index) => (
            <span
              key={index}
              className={`h-full flex-1 ${
                (index + 1) / 14 <= fill / 100 ? "bg-signal" : "bg-transparent"
              }`}
            />
          ))}
        </div>
      </div>
      <span className="border border-line px-2 py-1 font-mono text-[10px] tracking-[0.18em] text-white">
        {state.plan === "trial" ? `${String(state.daysLeft).padStart(2, "0")}D` : state.label}
      </span>
    </div>
  );
}
