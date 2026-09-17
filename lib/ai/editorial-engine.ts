import type { CreationMode, InteractionLevel } from "@/lib/settings";
import {
  clipManuscript,
  htmlFromPlain,
  type EditorialProposal,
  type EditorialResult,
} from "@/lib/editorial";
import { runEdiaEditorial } from "@/lib/ai/local-editor";

const SYSTEM = `Eres el editor jefe de ED/IA, una editorial digital. Trabajas en español o inglés según indique el usuario.
Devuelves SOLO JSON válido con esta forma:
{
  "summary": "string",
  "revisedHtml": "HTML con <p>, <h1>, <h2>, <blockquote>, <em>, <strong>",
  "proposals": [
    {
      "id": "p1",
      "severity": "major" | "minor",
      "kind": "grammar" | "style" | "clarity" | "structure" | "voice",
      "original": "fragmento EXACTO del manuscrito",
      "proposed": "versión editada",
      "reason": "por qué, en una frase"
    }
  ]
}
Reglas:
- Conserva la voz del autor. No reescribas el libro entero si no hace falta.
- Máximo 8 propuestas. Prioriza cambios de mayor impacto.
- "original" debe copiarse literalmente del texto recibido.
- No inventes tramas, personajes ni finales.
- revisedHtml es el manuscrito completo ya editado (HTML simple).`;

function interactionBrief(level: InteractionLevel) {
  if (level === "high") {
    return "Nivel ALTO: propone también matices de estilo; marca casi todo como major.";
  }
  if (level === "low") {
    return "Nivel BAJO: solo correcciones claras de gramática, ritmo y claridad. La mayoría minor.";
  }
  return "Nivel MEDIO: major solo si cambia sentido, estructura o voz. El resto minor.";
}

export function buildEditorialPrompt(input: {
  title: string;
  text: string;
  html: string;
  mode: CreationMode;
  interaction: InteractionLevel;
  language: "es" | "en";
  userPrompt?: string;
}) {
  const { text, clipped } = clipManuscript(input.text);
  const modeLine =
    input.mode === "autopilot"
      ? "Modo AUTOPILOT: edita con criterio editorial autónomo."
      : "Modo SUPERVISOR: cada cambio importante debe poder confirmarse uno a uno.";

  return [
    `Idioma de trabajo: ${input.language === "en" ? "English" : "español"}.`,
    modeLine,
    interactionBrief(input.interaction),
    `Título: ${input.title || "Sin título"}`,
    clipped ? "El manuscrito se recortó por longitud; edita solo el fragmento recibido." : "",
    input.userPrompt ? `Instrucción extra del autor: ${input.userPrompt}` : "",
    "Manuscrito (texto):",
    text || "(vacío)",
    "Manuscrito (HTML):",
    clipManuscript(input.html).text || "<p></p>",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function parseResult(raw: string, fallbackHtml: string, provider: EditorialResult["provider"]): EditorialResult {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  const slice = start >= 0 && end > start ? raw.slice(start, end + 1) : "{}";
  const parsed = JSON.parse(slice) as Partial<EditorialResult>;
  const proposals = Array.isArray(parsed.proposals)
    ? parsed.proposals
        .filter((item): item is EditorialProposal => Boolean(item?.original && item?.proposed))
        .slice(0, 8)
        .map((item, index) => ({
          id: item.id || `p${index + 1}`,
          severity: (item.severity === "major" ? "major" : "minor") as EditorialProposal["severity"],
          kind: item.kind ?? "style",
          original: String(item.original),
          proposed: String(item.proposed),
          reason: String(item.reason || "Ajuste editorial."),
        }))
    : [];

  return {
    summary: String(parsed.summary || "Revisión editorial lista."),
    revisedHtml: String(parsed.revisedHtml || fallbackHtml),
    proposals,
    provider,
  };
}

async function runAnthropic(prompt: string, fallbackHtml: string): Promise<EditorialResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("missing-anthropic");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
      max_tokens: 4000,
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`anthropic-${response.status}`);
  }

  const payload = (await response.json()) as {
    content?: Array<{ text?: string }>;
  };
  const text = payload.content?.map((part) => part.text ?? "").join("\n") ?? "{}";
  return parseResult(text, fallbackHtml, "anthropic");
}

async function runOpenAI(prompt: string, fallbackHtml: string): Promise<EditorialResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("missing-openai");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`openai-${response.status}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return parseResult(payload.choices?.[0]?.message?.content ?? "{}", fallbackHtml, "openai");
}

export async function runEditorial(input: {
  title: string;
  text: string;
  html: string;
  mode: CreationMode;
  interaction: InteractionLevel;
  language: "es" | "en";
  userPrompt?: string;
}): Promise<EditorialResult> {
  if (!input.text.trim()) {
    throw new Error("empty");
  }

  const prompt = buildEditorialPrompt(input);
  const fallbackHtml = input.html || htmlFromPlain(input.text);

  if (process.env.ANTHROPIC_API_KEY) {
    return runAnthropic(prompt, fallbackHtml);
  }
  if (process.env.OPENAI_API_KEY) {
    return runOpenAI(prompt, fallbackHtml);
  }

  return runEdiaEditorial(input.text, fallbackHtml, input.userPrompt);
}
