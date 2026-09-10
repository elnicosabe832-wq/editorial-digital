export const GUEST_MANUSCRIPT_KEY = "ed.guest.manuscript";
export const ACCEPTED_IMPORT_TYPES = ".docx,.txt,.pdf";
export const MAX_IMPORT_BYTES = 12 * 1024 * 1024;

export type GuestDraft = {
  title: string;
  content: unknown;
  sourceFilename?: string | null;
};

export function loadGuestDraft(): GuestDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(GUEST_MANUSCRIPT_KEY);
    return raw ? (JSON.parse(raw) as GuestDraft) : null;
  } catch {
    return null;
  }
}

export function saveGuestDraft(draft: GuestDraft) {
  localStorage.setItem(GUEST_MANUSCRIPT_KEY, JSON.stringify(draft));
}

export function clearGuestDraft() {
  localStorage.removeItem(GUEST_MANUSCRIPT_KEY);
}

export function titleFromFilename(name: string) {
  return name.replace(/\.[^.]+$/, "").trim() || "Sin título";
}

export async function importManuscriptFile(file: File) {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch("/api/import", {
    method: "POST",
    body: form,
  });

  const payload = (await response.json().catch(() => ({}))) as {
    html?: string;
    title?: string;
    error?: string;
  };

  if (!response.ok || !payload.html) {
    throw new Error(payload.error ?? "No se pudo importar el archivo");
  }

  return {
    html: payload.html,
    title: payload.title ?? titleFromFilename(file.name),
  };
}
