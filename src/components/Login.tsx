import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { supabase } from "../lib/supabaseClient";

interface LoginProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function Login({ onCancel, onSuccess }: LoginProps) {
  const shouldReduceMotion = useReducedMotion();
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
              full_name: fullName,
              grade: grade,
            },
          },
        });
        if (error) throw error;

        if (data.session) {
          setSuccessMessage("Account created successfully!");
          setTimeout(() => onSuccess?.(), 400);
        } else {
          setSuccessMessage("Confirmation link sent to your email address.");
          setIsSubmitting(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        setSuccessMessage("Signed in successfully!");
        setTimeout(() => onSuccess?.(), 300);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-5xl mx-auto flex items-center justify-between"
      >
        <button
          onClick={onCancel}
          aria-label="Back to homepage"
          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-all duration-150 active:scale-[0.97]"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
          Back to Overview
        </button>
        <ThemeToggle />
      </motion.div>

      {/* Main Card Container */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 14, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl mx-auto my-8"
      >
        <div className="rounded-md border border-border bg-card grid grid-cols-1 md:grid-cols-12 overflow-hidden shadow-xs md:min-h-[580px]">
          
          {/* Left Context Column (5 cols) */}
          <div className="md:col-span-5 p-6 sm:p-8 bg-secondary/40 border-b md:border-b-0 md:border-r border-border flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-foreground text-background flex items-center justify-center font-bold font-mono text-xs">
                  E
                </div>
                <span className="font-semibold text-sm text-foreground tracking-tight">
                  EduScrapeApp
                </span>
              </div>

              <div className="min-h-[72px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mode}
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                      {isCreate ? "Create workspace account" : "Access your workspace"}
                    </h2>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                      {isCreate
                        ? "Set up your personal Class 1–12 bookshelf, sync study notes across devices, and query diagrams."
                        : "Browse Class 1–12 NCERT textbooks, track study progress, and query diagrams via Gemini 2.0 Flash vision."}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <ul className="space-y-3 pt-2 font-mono text-xs list-none p-0 m-0">
                <li className="p-3 rounded-md bg-background/60 transition-colors">
                  <div className="font-semibold text-foreground text-xs mb-0.5">
                    Class 1–12 Library
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Complete syllabus taxonomy and watermark-free PDFs.
                  </div>
                </li>

                <li className="p-3 rounded-md bg-background/60 transition-colors">
                  <div className="font-semibold text-foreground text-xs mb-0.5">
                    Offline Sync Ready
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Export archives directly to companion ESP32 hardware.
                  </div>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-border flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-foreground" />
              <span>Independent Open Education</span>
            </div>
          </div>

          {/* Right Form Column (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
            <div className="w-full max-w-sm mx-auto">
              
              {/* Animated Mode Tabs with Sliding Spring Pill */}
              <nav
                role="tablist"
                aria-label="Authentication mode"
                className="relative grid grid-cols-2 gap-1 p-1 rounded-md bg-secondary mb-6 text-xs font-medium"
              >
                <button
                  type="button"
                  role="tab"
                  id="tab-sign-in"
                  aria-selected={mode === "sign-in"}
                  onClick={() => {
                    setMode("sign-in");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`relative py-1.5 rounded-sm transition-colors text-xs font-medium z-10 cursor-pointer ${
                    mode === "sign-in"
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode === "sign-in" && (
                    <motion.div
                      layoutId="auth-tab-pill"
                      className="absolute inset-0 bg-card rounded-sm shadow-xs border border-border"
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 450, damping: 35 }
                      }
                    />
                  )}
                  <span className="relative z-10">Sign In</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  id="tab-create"
                  aria-selected={mode === "create"}
                  onClick={() => {
                    setMode("create");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`relative py-1.5 rounded-sm transition-colors text-xs font-medium z-10 cursor-pointer ${
                    mode === "create"
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode === "create" && (
                    <motion.div
                      layoutId="auth-tab-pill"
                      className="absolute inset-0 bg-card rounded-sm shadow-xs border border-border"
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 450, damping: 35 }
                      }
                    />
                  )}
                  <span className="relative z-10">Create Account</span>
                </button>
              </nav>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleOAuth}
                aria-label="Sign in with Google"
                disabled={isOAuthLoading || isSubmitting}
                className="w-full flex items-center justify-center gap-2.5 py-2 px-3 rounded-md border border-border bg-background text-xs font-medium hover:bg-secondary hover:border-muted-foreground transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isOAuthLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
              </button>

              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs uppercase font-mono text-muted-foreground">or email</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Error & Success Messages with Micro-Haptics */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    key="error-msg"
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, x: 0 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, x: [0, -4, 4, -2, 2, 0] }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-4 p-2.5 rounded-md border border-destructive/30 bg-[var(--pastel-red-bg)] text-xs text-[var(--pastel-red-text)] flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    key="success-msg"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="mb-4 p-2.5 rounded-md border border-emerald-500/30 bg-[var(--pastel-green-bg)] text-xs text-[var(--pastel-green-text)] flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form className="space-y-3.5" onSubmit={handleSubmit}>
                {/* Dynamically Expanded Create Fields */}
                <AnimatePresence initial={false}>
                  {isCreate && (
                    <motion.div
                      key="create-fields-top"
                      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden space-y-3.5"
                    >
                      <div className="space-y-1 pt-1">
                        <label className="block text-xs font-mono text-muted-foreground uppercase" htmlFor="login-name">
                          Full Name
                        </label>
                        <input
                          id="login-name"
                          name="full_name"
                          type="text"
                          placeholder="Reyansh Niranjan"
                          className="auth-input-field"
                          required={isCreate}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-mono text-muted-foreground uppercase" htmlFor="login-grade">
                          Grade Level
                        </label>
                        <div className="relative flex items-center">
                          <select
                            id="login-grade"
                            name="grade"
                            defaultValue="10"
                            className="auth-input-field appearance-none pr-9 cursor-pointer"
                          >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((gradeNum) => (
                              <option key={gradeNum} value={String(gradeNum)} className="bg-card text-foreground">
                                Class {gradeNum}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-3 pointer-events-none" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-1">
                  <label className="block text-xs font-mono text-muted-foreground uppercase" htmlFor="login-email">
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="student@example.com"
                    className="auth-input-field"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono text-muted-foreground uppercase" htmlFor="login-password">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={passwordValue}
                      onChange={(e) => setPasswordValue(e.target.value)}
                      placeholder="••••••••"
                      className="auth-input-field pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute right-1 w-8 h-8 flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Dynamically Expanded Confirm Password Field */}
                <AnimatePresence initial={false}>
                  {isCreate && (
                    <motion.div
                      key="create-confirm-field"
                      initial={shouldReduceMotion ? undefined : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={shouldReduceMotion ? undefined : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1 pt-1">
                        <label className="block text-xs font-mono text-muted-foreground uppercase" htmlFor="login-confirm">
                          Confirm Password
                        </label>
                        <div className="relative flex items-center">
                          <input
                            id="login-confirm"
                            name="password_confirm"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="auth-input-field pr-10"
                            required={isCreate}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                            aria-pressed={showConfirmPassword}
                            className="absolute right-1 w-8 h-8 flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
                          >
                            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={isSubmitting || isOAuthLoading}
                  className="auth-button mt-4 relative overflow-hidden transition-all duration-150 active:scale-[0.98]"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isSubmitting ? (
                      <motion.div
                        key="submitting"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isCreate ? "Creating account..." : "Signing in..."}</span>
                      </motion.div>
                    ) : (
                      <motion.span
                        key={mode}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.12 }}
                      >
                        {isCreate ? "Create Workspace Account" : "Sign In to Library"}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </form>

            </div>
          </div>

        </div>
      </motion.div>

      {/* Bottom Footer Line */}
      <motion.div
        initial={shouldReduceMotion ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="w-full max-w-5xl mx-auto text-center text-xs font-mono text-muted-foreground"
      >
        EduScrapeApp · Class 1–12 Automated Curriculum Platform
      </motion.div>
    </div>
  );
}
