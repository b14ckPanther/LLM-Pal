import type { SupabaseClient } from "@supabase/supabase-js";

export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: { id: string; email?: string | null },
) {
  await supabase.from("users").upsert({
    id: user.id,
    email: user.email ?? "",
    updated_at: new Date().toISOString(),
  });
}
