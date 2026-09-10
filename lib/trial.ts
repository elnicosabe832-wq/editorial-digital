import type { Profile } from "@/types/database";

export type TrialPlan = "guest" | "trial" | "free" | "premium";

export type TrialState = {
  plan: TrialPlan;
  label: string;
  daysLeft: number | null;
  trialActive: boolean;
  premiumUnlocked: boolean;
};

export function getTrialState(
  profile: Pick<Profile, "plan" | "trial_ends_at"> | null,
): TrialState {
  if (!profile) {
    return {
      plan: "guest",
      label: "GUEST",
      daysLeft: null,
      trialActive: false,
      premiumUnlocked: false,
    };
  }

  if (profile.plan === "premium") {
    return {
      plan: "premium",
      label: "PREMIUM",
      daysLeft: null,
      trialActive: false,
      premiumUnlocked: true,
    };
  }

  const msLeft = new Date(profile.trial_ends_at).getTime() - Date.now();
  const daysLeft = Math.max(0, Math.ceil(msLeft / 86_400_000));
  const trialActive = profile.plan === "trial" && daysLeft > 0;

  return {
    plan: trialActive ? "trial" : "free",
    label: trialActive ? "TRIAL" : "FREE",
    daysLeft: trialActive ? daysLeft : 0,
    trialActive,
    premiumUnlocked: trialActive,
  };
}

export function formatTrialMeter(state: TrialState) {
  if (state.plan === "premium") return "PREMIUM // UNLOCKED";
  if (state.plan === "guest") return "WRITE FREE // LOGIN FOR 14D TRIAL";
  if (state.trialActive) return `${String(state.daysLeft).padStart(2, "0")}D TRIAL LEFT`;
  return "TRIAL EXPIRED // FREE EDITOR";
}
