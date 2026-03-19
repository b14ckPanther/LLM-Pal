import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const fallbackUrl = "https://placeholder.supabase.co";
  const fallbackAnonKey = "placeholder-anon-key";

  return createBrowserClient(url ?? fallbackUrl, anonKey ?? fallbackAnonKey);
}
