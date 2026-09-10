"use client";

import { Modal } from "@/components/ui/Modal";
import type { CreationMode, EditorSettings, InteractionLevel } from "@/lib/settings";
import type { TrialState } from "@/lib/trial";

type SettingsModalProps = {
  open: boolean;
  settings: EditorSettings;
  trial: TrialState;
  signedIn: boolean;
  onClose: () => void;
  onChange: (settings: EditorSettings) => void;
};

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ id: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.28em] text-ghost">{label}</p>
      <div className={`mt-2 grid gap-2 ${options.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`h-10 border font-mono text-[10px] tracking-[0.14em] uppercase ${
              value === option.id ? "border-signal text-white" : "border-line text-ghost"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SettingsModal({
  open,
  settings,
  trial,
  signedIn,
  onClose,
  onChange,
}: SettingsModalProps) {
  return (
    <Modal open={open} title="Configuración" code="CFG/SYS" onClose={onClose}>
      <div className="space-y-5">
        <Choice<CreationMode>
          label="MODO DE CREACIÓN"
          value={settings.mode}
          onChange={(mode) => onChange({ ...settings, mode })}
          options={[
            { id: "supervisor", label: "Supervisor" },
            { id: "autopilot", label: "Autopilot" },
          ]}
        />
        <Choice<InteractionLevel>
          label="NIVEL DE INTERACCIÓN IA"
          value={settings.interaction}
          onChange={(interaction) => onChange({ ...settings, interaction })}
          options={[
            { id: "high", label: "Alto" },
            { id: "medium", label: "Medio" },
            { id: "low", label: "Bajo" },
          ]}
        />
        <Choice<"es" | "en">
          label="IDIOMA DEL MANUSCRITO"
          value={settings.language}
          onChange={(language) => onChange({ ...settings, language })}
          options={[
            { id: "es", label: "ES" },
            { id: "en", label: "EN" },
          ]}
        />

        <div className="border border-line bg-panel p-3 font-mono text-[11px] leading-5 tracking-wide text-ghost">
          {signedIn ? (
            <>
              CUENTA // {trial.label}
              <br />
              {trial.trialActive
                ? `Prueba Premium: ${trial.daysLeft} días restantes.`
                : trial.plan === "premium"
                  ? "Funciones avanzadas desbloqueadas."
                  : "El editor sigue gratis. La IA, 3D y KDP son Premium."}
            </>
          ) : (
            <>
              GUEST // escritura 100% gratis.
              <br />
              Login con Google = 14 días de prueba para funciones Premium.
            </>
          )}
        </div>

        {signedIn ? (
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="h-10 w-full border border-line font-mono text-[10px] tracking-[0.22em] uppercase text-ghost hover:text-white"
            >
              Cerrar sesión
            </button>
          </form>
        ) : null}
      </div>
    </Modal>
  );
}
