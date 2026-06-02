import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { supabase } from "../lib/supabaseClient";

interface LoginProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function Login({ onCancel, onSuccess }: LoginProps) {
  const [mode, setMode] = useState<"sign-in" | "create">("sign-in");
  const isCreate = mode === "create";
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <section id="login" className="py-20" style={{ background: "var(--theme-bg)" }}>
      <div className="container mx-auto px-6">
        <div className="flex justify-end mb-6">
          <ThemeToggle />
        </div>
        <div
          className="flex flex-col md:flex-row overflow-hidden rounded-2xl"
          style={{ border: "1px solid var(--theme-border)" }}
        >
          <div
            className="hidden md:flex md:w-5/12 lg:w-1/2 p-10 relative items-center"
            style={{ background: "var(--theme-bg-secondary)" }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at top left, rgba(20, 184, 166, 0.15), transparent 55%), radial-gradient(circle at bottom right, rgba(139, 92, 246, 0.15), transparent 55%)",
              }}
            />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <img src="/logo-icon.svg" alt="EduScrapeApp" className="h-10 w-10 rounded-lg" />
                <span className="text-2xl font-semibold" style={{ color: "var(--theme-text)" }}>
                  EduScrapeApp
                </span>
              </div>
              <h2 className="text-3xl font-semibold leading-tight" style={{ color: "var(--theme-text)" }}>
                {isCreate ? "Create your EduScrapeApp account" : "Sign in to access your dashboard"}
              </h2>
              <p className="text-base" style={{ color: "var(--theme-text-secondary)" }}>
                Keep lesson workflows, AI-ready content, and curriculum insights in one place.
              </p>
            </div>
          </div>

          <div className="flex-1 p-8 md:p-12" style={{ background: "var(--theme-card-bg)" }}>
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <h3 className="text-3xl font-semibold" style={{ color: "var(--theme-text)" }}>
                  {isCreate ? "Create Account" : "Sign In"}
                </h3>
                <p className="mt-2 text-sm" style={{ color: "var(--theme-text-secondary)" }}>
                  {isCreate ? "Create an account to continue" : "Sign in to access your dashboard"}
                </p>
              </div>

              <form
                className="space-y-5"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (isSubmitting) return;
                  setErrorMessage(null);
                  setIsSubmitting(true);

                  const form = event.currentTarget;
                  const formData = new FormData(form);
                  const email = String(formData.get("email") || "").trim();
                  const password = String(formData.get("password") || "");
                  const fullName = String(formData.get("full_name") || "").trim();
                  const grade = String(formData.get("grade") || "").trim();
                  const passwordConfirm = String(formData.get("password_confirm") || "");

                  if (!email || !password) {
                    setErrorMessage("Please enter your email and password.");
                    setIsSubmitting(false);
                    return;
                  }

                  if (isCreate && password !== passwordConfirm) {
                    setErrorMessage("Passwords do not match.");
                    setIsSubmitting(false);
                    return;
                  }

                  try {
                    if (isCreate) {
                      const { error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                          data: {
                            full_name: fullName || undefined,
                            grade: grade || undefined,
                          },
                        },
                      });

                      if (error) {
                        setErrorMessage(error.message);
                        setIsSubmitting(false);
                        return;
                      }

                      onSuccess?.();
                    } else {
                      const { error } = await supabase.auth.signInWithPassword({ email, password });
                      if (error) {
                        setErrorMessage(error.message);
                        setIsSubmitting(false);
                        return;
                      }

                      onSuccess?.();
                    }
                  } catch (error) {
                    const message = error instanceof Error ? error.message : "Login failed.";
                    setErrorMessage(message);
                    setIsSubmitting(false);
                  }
                }}
              >
                {errorMessage ? (
                  <div
                    className="rounded-lg border px-4 py-3 text-sm"
                    style={{ borderColor: "var(--color-purple)", color: "var(--theme-text)" }}
                  >
                    {errorMessage}
                  </div>
                ) : null}
                {isCreate ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest" style={{ color: "var(--theme-text-secondary)" }} htmlFor="login-name">
                        Full Name
                      </label>
                      <div className="flex items-center">
                        <input
                          id="login-name"
                          name="full_name"
                          type="text"
                          placeholder="Your name"
                          className="auth-input-field text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest" style={{ color: "var(--theme-text-secondary)" }} htmlFor="login-grade">
                        Grade
                      </label>
                      <div className="relative flex items-center">
                        <select
                          id="login-grade"
                          name="grade"
                          className="auth-input-field appearance-none pr-8 text-sm"
                          defaultValue=""
                        >
                          <option value="" disabled style={{ color: "var(--theme-text-secondary)", background: "var(--theme-input-bg)" }}>
                            Select grade
                          </option>
                          <option value="1" style={{ background: "var(--theme-input-bg)", color: "var(--theme-text)" }}>1st</option>
                          <option value="2" style={{ background: "var(--theme-input-bg)", color: "var(--theme-text)" }}>2nd</option>
                          <option value="3" style={{ background: "var(--theme-input-bg)", color: "var(--theme-text)" }}>3rd</option>
                          <option value="4" style={{ background: "var(--theme-input-bg)", color: "var(--theme-text)" }}>4th</option>
                          <option value="5" style={{ background: "var(--theme-input-bg)", color: "var(--theme-text)" }}>5th</option>
                          <option value="6" style={{ background: "var(--theme-input-bg)", color: "var(--theme-text)" }}>6th</option>
                          <option value="7" style={{ background: "var(--theme-input-bg)", color: "var(--theme-text)" }}>7th</option>
                          <option value="8" style={{ background: "var(--theme-input-bg)", color: "var(--theme-text)" }}>8th</option>
                          <option value="9" style={{ background: "var(--theme-input-bg)", color: "var(--theme-text)" }}>9th</option>
                          <option value="10" style={{ background: "var(--theme-input-bg)", color: "var(--theme-text)" }}>10th</option>
                          <option value="11" style={{ background: "var(--theme-input-bg)", color: "var(--theme-text)" }}>11th</option>
                          <option value="12" style={{ background: "var(--theme-input-bg)", color: "var(--theme-text)" }}>12th</option>
                        </select>
                        <span
                          className="pointer-events-none absolute right-3 text-xs"
                          style={{ color: "var(--theme-text-secondary)" }}
                        >
                          ▼
                        </span>
                      </div>
                    </div>
                  </>
                ) : null}
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest" style={{ color: "var(--theme-text-secondary)" }} htmlFor="login-email">
                    Email Address
                  </label>
                      <div className="flex items-center">
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      className="auth-input-field text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-widest" style={{ color: "var(--theme-text-secondary)" }} htmlFor="login-password">
                      {isCreate ? "Create Password" : "Password"}
                    </label>
                    {!isCreate ? (
                      <button type="button" className="text-xs" style={{ color: "var(--color-teal)" }}>
                        Forgot password?
                      </button>
                    ) : null}
                  </div>
                  <div className="flex items-center">
                    <input
                      id="login-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className="auth-input-field text-sm"
                    />
                  </div>
                </div>

                {isCreate ? (
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest" style={{ color: "var(--theme-text-secondary)" }} htmlFor="login-password-confirm">
                      Confirm Password
                    </label>
                    <div className="flex items-center">
                      <input
                        id="login-password-confirm"
                        name="password_confirm"
                        type="password"
                        placeholder="••••••••"
                        className="auth-input-field text-sm"
                      />
                    </div>
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="w-full rounded-lg py-3 text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(90deg, #8B5CF6 0%, #14B8A6 100%)" }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Please wait…" : isCreate ? "Create account" : "Continue"}
                </button>
              </form>

              <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-widest" style={{ color: "var(--theme-text-secondary)" }}>
                <div className="h-px flex-1" style={{ background: "var(--theme-border)" }} />
                {isCreate ? "Or sign up with" : "Or login with"}
                <div className="h-px flex-1" style={{ background: "var(--theme-border)" }} />
              </div>

              <button
                type="button"
                className="w-full rounded-lg border px-4 py-3 text-sm font-semibold"
                style={{ borderColor: "var(--theme-border)", color: "var(--theme-text)", background: "var(--theme-bg-secondary)" }}
                onClick={async () => {
                  if (isSubmitting) return;
                  setErrorMessage(null);
                  setIsSubmitting(true);
                  const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
                  const redirectTo = `${siteUrl}/#dashboard`;
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: { redirectTo },
                  });
                  if (error) {
                    setErrorMessage(error.message);
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Please wait…" : isCreate ? "Create with Google" : "Continue with Google"}
              </button>

              <p className="mt-6 text-center text-sm" style={{ color: "var(--theme-text-secondary)" }}>
                {isCreate ? "Already have an account?" : "New to the ecosystem?"}
                <button
                  type="button"
                  onClick={() => setMode(isCreate ? "sign-in" : "create")}
                  className="ml-2 font-semibold"
                  style={{ color: "var(--color-purple)" }}
                >
                  {isCreate ? "Sign in" : "Create account"}
                </button>
              </p>

              {onCancel ? (
                <div className="mt-6 text-center">
                  <button type="button" className="text-xs" style={{ color: "var(--theme-text-secondary)" }} onClick={onCancel}>
                    Back to home
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
