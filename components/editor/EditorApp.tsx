"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { JSONContent } from "@tiptap/react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SettingsModal } from "@/components/layout/SettingsModal";
import {
  ManuscriptEditor,
  type EditorApi,
} from "@/components/editor/ManuscriptEditor";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  ACCEPTED_IMPORT_TYPES,
  clearGuestDraft,
  importManuscriptFile,
  loadGuestDraft,
  saveGuestDraft,
} from "@/lib/manuscript";
import {
  defaultSettings,
  loadSettings,
  saveSettings,
  type CreationMode,
  type EditorSettings,
} from "@/lib/settings";
import { getTrialState } from "@/lib/trial";
import type { Manuscript, Profile } from "@/types/database";

export type EditorSession = {
  user: {
    id: string;
    email: string | null;
    fullName: string | null;
  } | null;
  profile: Pick<Profile, "plan" | "trial_ends_at"> | null;
};

const emptyDoc: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function EditorApp({ user, profile }: EditorSession) {
  const [title, setTitle] = useState("Sin título");
  const [manuscriptId, setManuscriptId] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<EditorSettings>(defaultSettings);
  const [savingLabel, setSavingLabel] = useState("DRAFT // LOCAL");
  const [importing, setImporting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [api, setApi] = useState<EditorApi | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<number | null>(null);
  const skipSaveRef = useRef(true);
  const latestRef = useRef({ title: "Sin título", manuscriptId: null as string | null });

  const trial = getTrialState(profile);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  useEffect(() => {
    latestRef.current = { title, manuscriptId };
  }, [title, manuscriptId]);

  const persist = useCallback(
    async (json: JSONContent, words: number) => {
      const currentTitle = latestRef.current.title || "Sin título";

      if (user && isSupabaseConfigured()) {
        const supabase = createClient();
        setSavingLabel("SYNC // SUPABASE");
        const payload = {
          title: currentTitle,
          content: json,
          word_count: words,
          user_id: user.id,
        };

        if (latestRef.current.manuscriptId) {
          const { error: updateError } = await supabase
            .from("manuscripts")
            .update(payload)
            .eq("id", latestRef.current.manuscriptId);
          if (updateError) throw updateError;
        } else {
          const { data, error: insertError } = await supabase
            .from("manuscripts")
            .insert(payload)
            .select("id")
            .single();
          if (insertError) throw insertError;
          setManuscriptId(data.id);
          latestRef.current.manuscriptId = data.id;
        }
        setSavingLabel("SAVED // CLOUD");
        return;
      }

      saveGuestDraft({ title: currentTitle, content: json });
      setSavingLabel("SAVED // LOCAL");
    },
    [user],
  );

  const scheduleSave = useCallback(
    (json: JSONContent, words: number) => {
      if (skipSaveRef.current) return;
      setSavingLabel("WRITING…");
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        persist(json, words).catch(() => setSavingLabel("ERR // SAVE"));
      }, 900);
    },
    [persist],
  );

  useEffect(() => {
    if (!api || bootstrapped) return;
    const editorApi = api;
    let cancelled = false;

    async function boot() {
      try {
        if (user && isSupabaseConfigured()) {
          const supabase = createClient();
          const { data } = await supabase
            .from("manuscripts")
            .select("*")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          const remote = data as Manuscript | null;
          const guest = loadGuestDraft();

          if (cancelled) return;

          if (remote) {
            setManuscriptId(remote.id);
            latestRef.current.manuscriptId = remote.id;
            setTitle(remote.title);
            setWordCount(remote.word_count);
            editorApi.setJson((remote.content as JSONContent) ?? emptyDoc);
            setSavingLabel("LOADED // CLOUD");
          } else if (guest) {
            setTitle(guest.title);
            editorApi.setJson((guest.content as JSONContent) ?? emptyDoc);
            await persist(guest.content as JSONContent, 0);
            clearGuestDraft();
          }
        } else {
          const guest = loadGuestDraft();
          if (guest) {
            setTitle(guest.title);
            editorApi.setJson((guest.content as JSONContent) ?? emptyDoc);
            setSavingLabel("LOADED // LOCAL");
          }
        }
      } catch {
        setSavingLabel("ERR // LOAD");
      } finally {
        if (!cancelled) {
          window.setTimeout(() => {
            skipSaveRef.current = false;
            setBootstrapped(true);
          }, 80);
        }
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [api, bootstrapped, persist, user]);

  const handleReady = useCallback((next: EditorApi) => {
    setApi(next);
  }, []);

  function handleUpdate(payload: { json: JSONContent; words: number; chars: number }) {
    setWordCount(payload.words);
    setCharCount(payload.chars);
    scheduleSave(payload.json, payload.words);
  }

  async function handleFile(file: File) {
    setError(null);
    setImporting(true);
    try {
      const imported = await importManuscriptFile(file);
      api?.setHtml(imported.html);
      setTitle(imported.title);
      latestRef.current.title = imported.title;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Importación fallida");
    } finally {
      setImporting(false);
    }
  }

  function handleNew() {
    setManuscriptId(null);
    latestRef.current.manuscriptId = null;
    setTitle("Sin título");
    latestRef.current.title = "Sin título";
    api?.clear();
    setWordCount(0);
    setCharCount(0);
    if (!user) {
      saveGuestDraft({ title: "Sin título", content: emptyDoc });
      setSavingLabel("DRAFT // LOCAL");
    } else {
      setSavingLabel("NEW // UNSAVED");
    }
  }

  function handleModeChange(mode: CreationMode) {
    const next = { ...settings, mode };
    setSettings(next);
    saveSettings(next);
  }

  function handleSettingsChange(next: EditorSettings) {
    setSettings(next);
    saveSettings(next);
  }

  return (
    <div className="flex min-h-screen flex-col bg-void">
      <AppHeader
        title={title}
        onTitleChange={(value) => {
          setTitle(value);
          latestRef.current.title = value;
          if (api) scheduleSave(api.getJson(), wordCount);
        }}
        trial={trial}
        signedIn={Boolean(user)}
        userLabel={user?.fullName ?? user?.email}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="relative flex min-h-0 flex-1">
        <AppSidebar
          open={sidebarOpen}
          wordCount={wordCount}
          charCount={charCount}
          savingLabel={savingLabel}
          mode={settings.mode}
          premiumUnlocked={trial.premiumUnlocked}
          trial={trial}
          onNew={handleNew}
          onImportClick={() => fileRef.current?.click()}
          onModeChange={handleModeChange}
        />

        {sidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar sidebar"
          />
        ) : null}

        <main
          className="relative min-w-0 flex-1 overflow-y-auto bg-void"
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            const file = event.dataTransfer.files[0];
            if (file) void handleFile(file);
          }}
        >
          <div className="technical-grid pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] tracking-[0.28em] text-ghost">
                04 / LIENZO · {user ? "CLOUD" : "GUEST"}
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="border border-dashed border-line px-3 py-2 font-mono text-[10px] tracking-[0.18em] uppercase text-ghost hover:text-white"
              >
                Subir .docx / .txt / .pdf
              </button>
            </div>

            {error ? (
              <p className="mb-4 border border-signal px-3 py-2 font-mono text-[11px] text-signal">
                ERR // {error}
              </p>
            ) : null}

            <div className="relative">
              <ManuscriptEditor onReady={handleReady} onUpdate={handleUpdate} />
              {importing ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
                  <p className="border border-line bg-void px-4 py-3 font-mono text-xs tracking-[0.2em]">
                    IMPORTANDO…
                  </p>
                </div>
              ) : null}
              {dragging ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center border border-dashed border-signal bg-void/80">
                  <p className="font-mono text-xs tracking-[0.24em]">DROP MANUSCRIPT</p>
                </div>
              ) : null}
            </div>
          </div>
        </main>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_IMPORT_TYPES}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = "";
        }}
      />

      <SettingsModal
        open={settingsOpen}
        settings={settings}
        trial={trial}
        signedIn={Boolean(user)}
        onClose={() => setSettingsOpen(false)}
        onChange={handleSettingsChange}
      />
    </div>
  );
}
