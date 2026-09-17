export type ProposalSeverity = "major" | "minor";
export type ProposalKind = "grammar" | "style" | "clarity" | "structure" | "voice";

export type EditorialProposal = {
  id: string;
  severity: ProposalSeverity;
  kind: ProposalKind;
  original: string;
  proposed: string;
  reason: string;
};

export type EditorialResult = {
  summary: string;
  revisedHtml: string;
  proposals: EditorialProposal[];
  provider: "anthropic" | "openai" | "edia";
};

const MAX_CHARS = 12_000;

export function clipManuscript(text: string) {
  const trimmed = text.trim();
  if (trimmed.length <= MAX_CHARS) return { text: trimmed, clipped: false };
  return { text: trimmed.slice(0, MAX_CHARS), clipped: true };
}

export function htmlFromPlain(text: string) {
  const blocks = text
    .replaceAll("\r\n", "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) return "<p></p>";

  return blocks
    .map((block) => `<p>${escapeHtml(block).replaceAll("\n", "<br>")}</p>`)
    .join("");
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function applyProposalToHtml(html: string, proposal: EditorialProposal) {
  if (!proposal.original) return html;
  if (html.includes(proposal.original)) {
    return html.replace(proposal.original, proposal.proposed);
  }

  const escaped = escapeHtml(proposal.original);
  if (html.includes(escaped)) {
    return html.replace(escaped, escapeHtml(proposal.proposed));
  }

  return html;
}

export function proposalsToConfirm(
  proposals: EditorialProposal[],
  mode: "supervisor" | "autopilot",
  interaction: "high" | "medium" | "low",
) {
  if (mode === "supervisor" || interaction === "high") return proposals;
  if (interaction === "medium") {
    return proposals.filter((item) => item.severity === "major");
  }
  return [];
}

export function autoApplyProposals(
  html: string,
  proposals: EditorialProposal[],
  mode: "supervisor" | "autopilot",
  interaction: "high" | "medium" | "low",
) {
  if (mode === "supervisor" || interaction === "high") return html;

  const auto =
    interaction === "low"
      ? proposals
      : proposals.filter((item) => item.severity === "minor");

  return auto.reduce((current, proposal) => applyProposalToHtml(current, proposal), html);
}
