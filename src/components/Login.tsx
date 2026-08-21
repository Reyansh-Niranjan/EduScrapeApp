import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  GraduationCap,
  Eye,
  EyeOff,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Flame,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordValue, setPasswordValue] = useState("");

  const handleOAuth = async () => {
    if (isOAuthLoading || isSubmitting) return;
    setErrorMessage(null);
    setIsOAuthLoading(true);
    try {
      const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      const redirectTo = `${siteUrl}/#dashboard`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) {
        setErrorMessage(error.message);
        setIsOAuthLoading(false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "OAuth authentication failed.";
      setErrorMessage(msg);
      setIsOAuthLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || isOAuthLoading) return;
    setErrorMessage(null);
    setSuccessMessage(null);
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

    if (isCreate) {
      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters long.");
        setIsSubmitting(false);
        return;
      }
      if (password !== passwordConfirm) {
        setErrorMessage("Passwords do not match.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      if (isCreate) {
        const { error, data } = await supabase.auth.signUp({
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

        if (data?.session) {
          onSuccess?.();
        } else {
          setSuccessMessage(
            "Account created! Please check your email inbox to verify your account."
          );
          setIsSubmitting(false);
        }
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
      const message = error instanceof Error ? error.message : "Authentication failed.";
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="login"
      className="relative min-h-screen flex items-center justify-center px-4 py-12 md:py-16 overflow-hidden"
      style={{ background: "var(--theme-bg)" }}
    >
      {/* Dynamic Background Ambient Light Orbs */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full blur-3xl opacity-30 dark:opacity-20"
        style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full blur-3xl opacity-30 dark:opacity-20"
        style={{ background: "radial-gradient(circle, #14B8A6 0%, transparent 70%)" }}
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        {/* Top bar navigation */}
        <div className="mb-6 flex items-center justify-between">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105"
              style={{
                background: "var(--theme-card-bg)",
                border: "1px solid var(--theme-border)",
                color: "var(--theme-text-secondary)",
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </button>
          ) : (
            <div />
          )}
          <ThemeToggle />
        </div>

        {/* Main Card Container */}
        <div
          className="overflow-hidden rounded-3xl border shadow-2xl flex flex-col md:flex-row transition-all duration-300"
          style={{
            background: "var(--theme-card-bg)",
            borderColor: "var(--theme-border)",
            boxShadow: "0 25px 60px -15px rgba(0,0,0,0.15)",
          }}
        >
          {/* Left Showcase Banner (Desktop) */}
          <div
            className="hidden md:flex md:w-5/12 lg:w-1/2 p-8 lg:p-12 relative flex-col justify-between overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, var(--theme-bg-secondary), var(--theme-card-bg))",
              borderRight: "1px solid var(--theme-border)",
            }}
          >
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.2), transparent 45%), radial-gradient(circle at 90% 80%, rgba(20, 184, 166, 0.2), transparent 45%)",
              }}
            />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-teal-500 text-white shadow-lg shadow-purple-500/20">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight text-[var(--theme-text)]">
                    EduScrape<span className="text-purple-500">App</span>
                  </span>
                  <p className="text-[10px] uppercase font-semibold tracking-wider text-teal-400">
                    Free AI-Powered Learning
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl lg:text-3xl font-extrabold leading-tight text-[var(--theme-text)]">
                  {isCreate ? "Join thousands of smart learners" : "Welcome back to your study hub"}
                </h2>
                <p className="mt-2 text-sm text-[var(--theme-text-secondary)] leading-relaxed">
                  Access complete NCERT textbooks, track your reading progress, and unlock AI study tools — completely free.
                </p>
              </div>

              {/* Feature Pills */}
              <div className="space-y-3 pt-2">
                <div
                  className="flex items-center gap-3.5 p-3 rounded-2xl border transition-all"
                  style={{
                    background: "var(--theme-bg)",
                    borderColor: "var(--theme-border)",
                  }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 flex-shrink-0">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--theme-text)]">
                      Comprehensive NCERT & CBSE
                    </p>
                    <p className="text-[11px] text-[var(--theme-text-secondary)]">
                      Class 1 to 12 digital textbooks ready to read
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-3.5 p-3 rounded-2xl border transition-all"
                  style={{
                    background: "var(--theme-bg)",
                    borderColor: "var(--theme-border)",
                  }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 flex-shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--theme-text)]">
                      AI Study Companion
                    </p>
                    <p className="text-[11px] text-[var(--theme-text-secondary)]">
                      Instant explanations and smart notes on demand
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-3.5 p-3 rounded-2xl border transition-all"
                  style={{
                    background: "var(--theme-bg)",
                    borderColor: "var(--theme-border)",
                  }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--theme-text)]">
                      Streak & Activity Tracking
                    </p>
                    <p className="text-[11px] text-[var(--theme-text-secondary)]">
                      Build daily study habits and stay consistent
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom trust footer */}
            <div className="relative z-10 pt-6 border-t border-[var(--theme-border)] flex items-center justify-between text-xs text-[var(--theme-text-secondary)]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Zero Ads · 100% Free</span>
              </div>
              <span className="text-[11px] font-medium text-purple-400">Open Education</span>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="flex-1 p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto">
              {/* Mode Switcher Tabs */}
              <div
                className="relative p-1 rounded-2xl mb-8 flex border"
                style={{
                  background: "var(--theme-bg-secondary)",
                  borderColor: "var(--theme-border)",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMode("sign-in");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`relative z-10 flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                    mode === "sign-in"
                      ? "text-white shadow-md"
                      : "text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)]"
                  }`}
                >
                  {mode === "sign-in" && (
                    <motion.div
                      layoutId="auth-tab-pill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-teal-600"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("create");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`relative z-10 flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                    mode === "create"
                      ? "text-white shadow-md"
                      : "text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)]"
                  }`}
                >
                  {mode === "create" && (
                    <motion.div
                      layoutId="auth-tab-pill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-teal-600"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">Create Account</span>
                </button>
              </div>

              {/* Title & subtitle */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[var(--theme-text)]">
                  {isCreate ? "Create your free account" : "Sign in to your account"}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-[var(--theme-text-secondary)]">
                  {isCreate
                    ? "Start exploring digital books and AI study assistance today"
                    : "Enter your credentials to continue to your dashboard"}
                </p>
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleOAuth}
                disabled={isOAuthLoading || isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "var(--theme-bg)",
                  borderColor: "var(--theme-border)",
                  color: "var(--theme-text)",
                }}
              >
                {isOAuthLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>
                  {isOAuthLoading
                    ? "Connecting with Google..."
                    : isCreate
                    ? "Sign up with Google"
                    : "Continue with Google"}
                </span>
              </button>

              {/* Divider */}
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: "var(--theme-border)" }} />
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--theme-text-secondary)]">
                  Or with email
                </span>
                <div className="h-px flex-1" style={{ background: "var(--theme-border)" }} />
              </div>

              {/* Feedback Alerts */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-500 dark:text-red-400"
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span className="flex-1">{errorMessage}</span>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span className="flex-1">{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                {isCreate && (
                  <>
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label
                        className="block text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)]"
                        htmlFor="login-name"
                      >
                        Full Name
                      </label>
                      <div className="relative flex items-center">
                        <User className="pointer-events-none absolute left-3.5 h-4 w-4 text-[var(--theme-text-light)]" />
                        <input
                          id="login-name"
                          name="full_name"
                          type="text"
                          placeholder="e.g. John Doe"
                          className="auth-input-field pl-10 text-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Grade / Class Selector */}
                    <div className="space-y-1.5">
                      <label
                        className="block text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)]"
                        htmlFor="login-grade"
                      >
                        Select Class / Grade
                      </label>
                      <div className="relative flex items-center">
                        <GraduationCap className="pointer-events-none absolute left-3.5 h-4 w-4 text-[var(--theme-text-light)]" />
                        <select
                          id="login-grade"
                          name="grade"
                          defaultValue="10"
                          className="auth-input-field appearance-none pl-10 pr-9 text-sm cursor-pointer"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((gradeNum) => (
                            <option
                              key={gradeNum}
                              value={String(gradeNum)}
                              style={{
                                background: "var(--theme-input-bg)",
                                color: "var(--theme-text)",
                              }}
                            >
                              Class {gradeNum}
                            </option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-3.5 text-xs text-[var(--theme-text-secondary)]">
                          ▼
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)]"
                    htmlFor="login-email"
                  >
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-[var(--theme-text-light)]" />
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      className="auth-input-field pl-10 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      className="block text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)]"
                      htmlFor="login-password"
                    >
                      {isCreate ? "Create Password" : "Password"}
                    </label>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-[var(--theme-text-light)]" />
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={passwordValue}
                      onChange={(e) => setPasswordValue(e.target.value)}
                      placeholder="••••••••"
                      className="auth-input-field pl-10 pr-10 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 p-1 rounded-lg text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] transition"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (Sign Up only) */}
                {isCreate && (
                  <div className="space-y-1.5">
                    <label
                      className="block text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)]"
                      htmlFor="login-password-confirm"
                    >
                      Confirm Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-[var(--theme-text-light)]" />
                      <input
                        id="login-password-confirm"
                        name="password_confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="auth-input-field pl-10 pr-10 text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 p-1 rounded-lg text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] transition"
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isOAuthLoading}
                  className="auth-button mt-2 flex items-center justify-center gap-2 text-sm shadow-lg shadow-purple-500/25"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{isCreate ? "Creating account..." : "Signing in..."}</span>
                    </>
                  ) : (
                    <span>{isCreate ? "Get Started Free" : "Sign In to Dashboard"}</span>
                  )}
                </button>
              </form>

              {/* Bottom Switcher link */}
              <p className="mt-6 text-center text-xs text-[var(--theme-text-secondary)]">
                {isCreate ? "Already have an account?" : "New to EduScrapeApp?"}
                <button
                  type="button"
                  onClick={() => {
                    setMode(isCreate ? "sign-in" : "create");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="ml-1.5 font-bold text-purple-500 hover:text-purple-400 hover:underline transition"
                >
                  {isCreate ? "Sign In instead" : "Create a free account"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

