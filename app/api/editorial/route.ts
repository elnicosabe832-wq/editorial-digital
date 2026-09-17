import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTrialState } from "@/lib/trial";
import { runEditorial } from "@/lib/ai/editorial-engine";
import type { CreationMode, InteractionLevel } from "@/lib/settings";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  title?: string;
  text?: string;
  html?: string;
  mode?: CreationMode;
  interaction?: InteractionLevel;
  language?: "es" | "en";
  userPrompt?: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Inicia sesión para usar la IA editorial." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, trial_ends_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!getTrialState(profile).premiumUnlocked) {
    return NextResponse.json(
      { error: "La IA editorial es Premium. Entra con la cuenta de prueba o activa el trial." },
      { status: 403 },
    );
  }

  const body = (await request.json()) as Body;
  const text = body.text?.trim() ?? "";
  const html = body.html ?? "<p></p>";

  if (!text) {
    return NextResponse.json({ error: "El lienzo está vacío." }, { status: 400 });
  }

  try {
    const result = await runEditorial({
      title: body.title ?? "Sin título",
      text,
      html,
      mode: body.mode === "autopilot" ? "autopilot" : "supervisor",
      interaction:
        body.interaction === "high" || body.interaction === "low" ? body.interaction : "medium",
      language: body.language === "en" ? "en" : "es",
      userPrompt: body.userPrompt?.slice(0, 500),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("editorial failed", error);
    return NextResponse.json(
      { error: "El motor editorial no respondió. Revisa la API key o inténtalo de nuevo." },
      { status: 502 },
    );
  }
}
