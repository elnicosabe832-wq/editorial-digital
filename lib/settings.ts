export const SETTINGS_KEY = "ed.settings";

export type CreationMode = "supervisor" | "autopilot";
export type InteractionLevel = "high" | "medium" | "low";

export type EditorSettings = {
  mode: CreationMode;
  interaction: InteractionLevel;
  language: "es" | "en";
};

export const defaultSettings: EditorSettings = {
  mode: "supervisor",
  interaction: "medium",
  language: "es",
};

export function loadSettings(): EditorSettings {
  if (typeof window === "undefined") return defaultSettings;

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: EditorSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
