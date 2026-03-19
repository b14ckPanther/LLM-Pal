"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ensureUserProfile } from "@/features/auth/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthCard() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const action =
      mode === "sign-in"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });

    const { data, error: authError } = await action;
    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    const user = data.user;
    if (user) {
      await ensureUserProfile(supabase, { id: user.id, email: user.email ?? email });
    }

    setLoading(false);
    router.push("/chat");
    router.refresh();
  };

  return (
    <div className="surface glass w-full max-w-md rounded-3xl p-6 sm:p-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-[var(--text-secondary)]">Welcome to</p>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">LLMPal</h1>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          required
        />
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          required
          minLength={6}
        />
        {error ? <p className="text-sm text-[#ffc2d0]">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <div className="mt-6 text-sm text-[var(--text-secondary)]">
        {mode === "sign-in" ? "New here?" : "Already have an account?"}{" "}
        <button
          type="button"
          className="text-[var(--accent-primary)] transition-opacity hover:opacity-85"
          onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
        >
          {mode === "sign-in" ? "Create account" : "Sign in"}
        </button>
      </div>
      <button
        type="button"
        className="mt-4 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
        onClick={() => router.push("/chat")}
      >
        Continue as guest
      </button>
    </div>
  );
}
