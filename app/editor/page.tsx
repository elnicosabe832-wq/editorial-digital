import { createClient } from "@/lib/supabase/server";
import { EditorApp } from "@/components/editor/EditorApp";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function EditorPage() {
  if (!isSupabaseConfigured()) {
    return <EditorApp user={null} profile={null} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("plan, trial_ends_at")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }

  return (
    <EditorApp
      user={
        user
          ? {
              id: user.id,
              email: user.email ?? null,
              fullName:
                (user.user_metadata?.full_name as string | undefined) ??
                (user.user_metadata?.name as string | undefined) ??
                null,
            }
          : null
      }
      profile={profile}
    />
  );
}
