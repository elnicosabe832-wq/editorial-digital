import type { EditorialProposal, EditorialResult } from "@/lib/editorial";
import { applyProposalToHtml, htmlFromPlain } from "@/lib/editorial";

function cleanSpaces(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([,.;:!?…])/g, "$1")
    .replace(/([¿¡])\s+/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function stripFillers(value: string) {
  return value
    .replace(/\b(muy|bastante|realmente|absolutamente|obviamente|simplemente)\s+/gi, "")
    .replace(/\b(la la|el el|de de|que que)\b/gi, (match) => match.split(" ")[0] ?? match)
    .replace(/\s{2,}/g, " ")
    .trim();
}

function tightenComoDe(value: string) {
  return value.replace(
    /\bcomo ((?:un|una|el|la)\s[^,]{6,48}) de \w+\b/gi,
    "como $1",
  );
}

function splitAtCommaAnd(value: string) {
  const idx = value.search(/, y /i);
  if (idx < 18) return value;
  const left = value.slice(0, idx).trim();
  const right = value.slice(idx).replace(/^,\s*y\s+/i, "").trim();
  if (right.split(/\s+/).length < 4) return value;
  const capped = right.charAt(0).toUpperCase() + right.slice(1);
  const leftEnded = /[.!?…]$/.test(left) ? left : `${left}.`;
  return `${leftEnded} ${capped}`;
}

function splitLongSentence(value: string) {
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length < 24) return value;

  const from = Math.floor(value.length * 0.7);
  let pivot = value.lastIndexOf(", y ", from);
  if (pivot < 18) pivot = value.lastIndexOf("; ", from);
  if (pivot < 18) pivot = value.lastIndexOf(", ", Math.floor(value.length * 0.55));
  if (pivot < 18) return value;

  const firstRaw = value.slice(0, pivot).trim().replace(/[,;]$/, "");
  const first = /[.!?…]$/.test(firstRaw) ? firstRaw : `${firstRaw}.`;
  const second = value.slice(pivot).replace(/^[,;]\s*(y\s+)?/i, "").trim();
  if (!second) return value;
  const capped = second.charAt(0).toUpperCase() + second.slice(1);
  return `${first} ${capped}`;
}

function splitFirstClause(value: string) {
  const comma = value.indexOf(",");
  if (comma < 18 || comma > 110) return value;
  const after = value.slice(comma + 1).trim();
  if (after.split(/\s+/).length < 6) return value;
  const left = value.slice(0, comma).trim();
  if (/[.!?…]$/.test(left)) return value;
  return `${left}. ${after.charAt(0).toUpperCase()}${after.slice(1)}`;
}

function shortenParagraph(value: string) {
  const sentences = value.split(/(?<=[.!?…])\s+/).filter(Boolean);
  if (sentences.length <= 2) return stripFillers(cleanSpaces(value));
  return `${sentences[0]} ${sentences[sentences.length - 1]}`.trim();
}

function intimateVoice(value: string) {
  return value
    .replace(/\bdijo\b/gi, "susurró")
    .replace(/\bmiró\b/gi, "observó")
    .replace(/\bcaminó\b/gi, "se acercó")
    .replace(/\biluminaba\b/gi, "alumbraba")
    .replace(/\bsalieron\b/gi, "escaparon");
}

function inferIntent(prompt?: string) {
  const p = (prompt ?? "").toLowerCase();
  if (/acort|resum|breve|corto/.test(p)) return "shorten" as const;
  if (/intim|poetic|suave|liric/.test(p)) return "intimate" as const;
  if (/direct|seco|ritmo/.test(p)) return "tighten" as const;
  return "edit" as const;
}

function transform(paragraph: string, intent: ReturnType<typeof inferIntent>) {
  let next = tightenComoDe(stripFillers(cleanSpaces(paragraph)));

  if (intent === "shorten") next = shortenParagraph(next);
  if (intent === "intimate") next = intimateVoice(next);
  if (intent === "tighten" || intent === "edit") {
    const splitAnd = splitAtCommaAnd(next);
    if (splitAnd !== next) {
      next = splitAnd;
    } else {
      const long = splitLongSentence(next);
      next = long !== next ? long : splitFirstClause(next);
    }
  }

  return cleanSpaces(next);
}

function reasonFor(intent: ReturnType<typeof inferIntent>, major: boolean) {
  if (intent === "shorten") return "Recorte pedido: se conserva el arranque y el cierre.";
  if (intent === "intimate") return "Ajuste de voz hacia un registro más cercano.";
  if (major) return "Se parte la frase para mejorar el ritmo de lectura.";
  return "Limpieza de relleno, ritmo y puntuación.";
}

export function runEdiaEditorial(
  text: string,
  html: string,
  userPrompt?: string,
): EditorialResult {
  const intent = inferIntent(userPrompt);
  const paragraphs = text
    .split(/\n+/)
    .map((item) => item.trim())
    .filter((item) => item.split(/\s+/).length >= 8);

  const proposals: EditorialProposal[] = [];

  for (const [index, paragraph] of paragraphs.entries()) {
    if (proposals.length >= 8) break;
    const proposed = transform(paragraph, intent);
    if (!proposed || proposed === paragraph) continue;

    const major =
      intent === "shorten" ||
      paragraph.split(/\s+/).length > 28 ||
      Math.abs(proposed.length - paragraph.length) > 24;

    proposals.push({
      id: `edia-${index + 1}`,
      severity: major ? "major" : "minor",
      kind: intent === "intimate" ? "voice" : major ? "clarity" : "style",
      original: paragraph,
      proposed,
      reason: reasonFor(intent, major),
    });
  }

  let revised = html || htmlFromPlain(text);
  for (const proposal of proposals) {
    revised = applyProposalToHtml(revised, proposal);
  }

  return {
    summary:
      proposals.length > 0
        ? `ED/IA listo: ${proposals.length} propuesta${proposals.length === 1 ? "" : "s"}. ${
            userPrompt ? `Orden: “${userPrompt.slice(0, 80)}”.` : "Pasada editorial de claridad y ritmo."
          }`
        : "ED/IA no encontró cambios claros. Prueba una orden: “acorta”, “más íntimo”, “más directo”.",
    revisedHtml: revised,
    proposals,
    provider: "edia",
  };
}
