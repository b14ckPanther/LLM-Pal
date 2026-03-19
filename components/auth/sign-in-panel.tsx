"use client";

import { FormEvent, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, Mail, Lock, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ensureUserProfile } from "@/features/auth/profile";
import { useTranslations } from "@/hooks/use-translations";
import {
  getLanguageDirection,
  getLanguageCode,
  useLanguagePreference,
} from "@/hooks/use-language-preference";

type SignInPanelProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (userId: string) => void;
};

export function SignInPanel({ open, onClose, onSuccess }: SignInPanelProps) {
  const t = useTranslations();
  const { language, fontClassName } = useLanguagePreference();
  const dir = getLanguageDirection(language);
  const lang = getLanguageCode(language);

  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setEmail("");
    setPassword("");
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    let finished = false;

    const timeout = setTimeout(() => {
      if (!finished) {
        setLoading(false);
        setError(t.authTimeout);
      }
    }, 12000);

    try {
      const action =
        mode === "sign-in"
          ? supabase.auth.signInWithPassword({ email, password })
          : supabase.auth.signUp({ email, password });

      const { data, error: authError } = await action;
      clearTimeout(timeout);

      if (authError) {
        finished = true;
        clearTimeout(timeout);
        setLoading(false);
        setError(authError.message);
        return;
      }

      const user = data.user;
      const session = data.session;
      if (user && session) {
        finished = true;
        clearTimeout(timeout);
        reset();
        onSuccess(user.id);
        void ensureUserProfile(supabase, { id: user.id, email: user.email ?? email }).catch(() => {
          // Profile upsert can fail (RLS, missing table); non-blocking
        });
      } else if (user && !session) {
        finished = true;
        clearTimeout(timeout);
        setLoading(false);
        setError(t.confirmEmail);
      } else {
        finished = true;
        clearTimeout(timeout);
        setLoading(false);
        setError(t.confirmEmail);
      }
    } catch (err) {
      finished = true;
      clearTimeout(timeout);
      setLoading(false);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const isSignIn = mode === "sign-in";

  return (
    <AnimatePresence>
      {open ? (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            onClick={handleClose}
          />

          {/* Centered modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              dir={dir}
              lang={lang}
              className={`relative w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-lg)] ${fontClassName}`}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={handleClose}
                className="absolute end-3 top-3 z-10 rounded-lg p-1.5 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header */}
              <div className="px-6 pt-6 pb-2">
                <p className="text-lg font-semibold text-[var(--text-primary)]">
                  {isSignIn ? t.signInTitle : t.signUpTitle}
                </p>
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                  {isSignIn ? t.signInSubtitle : t.signInSubtitle}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={onSubmit} className="px-6 pt-4 pb-5 space-y-3.5">
                {/* Email field */}
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-[var(--text-tertiary)]">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    required
                    autoFocus
                    className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] ps-10 pe-3 text-sm text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] focus:outline-none focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                  />
                </div>

                {/* Password field */}
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-[var(--text-tertiary)]">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    required
                    minLength={6}
                    className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-base)] ps-10 pe-3 text-sm text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] focus:outline-none focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                  />
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error ? (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden rounded-lg border border-[rgba(217,48,37,0.2)] bg-[var(--danger-soft)] px-3 py-2 text-xs text-[var(--danger)]"
                    >
                      {error}
                    </motion.p>
                  ) : null}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] text-sm font-medium text-white shadow-[var(--shadow-sm)] transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>{isSignIn ? t.signIn : t.createAccount}</span>
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer divider + mode switch */}
              <div className="border-t border-[var(--border)] bg-[var(--bg-base)] px-6 py-4">
                <p className="text-center text-xs text-[var(--text-tertiary)]">
                  {isSignIn ? t.noAccount : t.alreadySignedUp}{" "}
                  <button
                    type="button"
                    className="font-semibold text-[var(--accent-text)] transition hover:underline"
                    onClick={() => {
                      setMode(isSignIn ? "sign-up" : "sign-in");
                      setError(null);
                    }}
                  >
                    {isSignIn ? t.signUp : t.signIn}
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
