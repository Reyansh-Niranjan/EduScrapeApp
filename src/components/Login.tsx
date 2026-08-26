import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  ArrowLeft,
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
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Overview
        </button>
        <ThemeToggle />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-4xl mx-auto my-8">
        <div className="rounded-md border border-border bg-card grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Left Context Column (5 cols) */}
          <div className="md:col-span-5 p-6 sm:p-8 bg-secondary/40 border-b md:border-b-0 md:border-r border-border flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md border border-border bg-card flex items-center justify-center p-1">
                  <img src="/logo-icon.svg" alt="EduScrapeApp" className="w-full h-full object-contain" />
                </div>
                <span className="font-semibold text-sm text-foreground tracking-tight">
                  EduScrapeApp
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {isCreate ? "Create workspace account" : "Access your workspace"}
                </h2>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  Browse Class 1–12 NCERT textbooks, track study progress, and query diagrams via Gemini 2.0 Flash vision.
                </p>
              </div>

              <div className="space-y-3 pt-2 font-mono text-xs">
                <div className="p-3 rounded-md border border-border bg-card">
                  <div className="font-semibold text-foreground text-[11px] mb-0.5">
                    Class 1–12 Library
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Complete syllabus taxonomy and watermark-free PDFs.
                  </div>
                </div>

                <div className="p-3 rounded-md border border-border bg-card">
                  <div className="font-semibold text-foreground text-[11px] mb-0.5">
                    Offline Sync Ready
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Export archives directly to companion ESP32 hardware.
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-border flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Independent Open Education</span>
            </div>
          </div>

          {/* Right Form Column (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
            <div className="w-full max-w-sm mx-auto">
              
              {/* Mode Tabs */}
              <div className="grid grid-cols-2 gap-1 p-1 rounded-md bg-secondary border border-border mb-6 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setMode("sign-in");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`py-1.5 rounded-sm transition-colors ${
                    mode === "sign-in"
                      ? "bg-card text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("create");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`py-1.5 rounded-sm transition-colors ${
                    mode === "create"
                      ? "bg-card text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Google OAuth */}
              <button
                type="button"
                onClick={handleOAuth}
                disabled={isOAuthLoading || isSubmitting}
                className="w-full flex items-center justify-center gap-2.5 py-2 px-3 rounded-md border border-border bg-background text-xs font-medium hover:bg-secondary transition disabled:opacity-50"
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
                <span className="text-[10px] uppercase font-mono text-muted-foreground">or email</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Error & Success Messages */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mb-4 p-2.5 rounded-md border border-destructive/30 bg-[var(--pastel-red-bg)] text-xs text-[var(--pastel-red-text)] flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mb-4 p-2.5 rounded-md border border-emerald-500/30 bg-[var(--pastel-green-bg)] text-xs text-[var(--pastel-green-text)] flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form className="space-y-3.5" onSubmit={handleSubmit}>
                {isCreate && (
                  <>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono text-muted-foreground uppercase" htmlFor="login-name">
                        Full Name
                      </label>
                      <input
                        id="login-name"
                        name="full_name"
                        type="text"
                        placeholder="Reyansh Niranjan"
                        className="auth-input-field"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono text-muted-foreground uppercase" htmlFor="login-grade">
                        Grade Level
                      </label>
                      <select
                        id="login-grade"
                        name="grade"
                        defaultValue="10"
                        className="auth-input-field"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((gradeNum) => (
                          <option key={gradeNum} value={String(gradeNum)}>
                            Class {gradeNum}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="block text-[11px] font-mono text-muted-foreground uppercase" htmlFor="login-email">
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
                  <label className="block text-[11px] font-mono text-muted-foreground uppercase" htmlFor="login-password">
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
                      className="auth-input-field pr-9"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {isCreate && (
                  <div className="space-y-1">
                    <label className="block text-[11px] font-mono text-muted-foreground uppercase" htmlFor="login-confirm">
                      Confirm Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id="login-confirm"
                        name="password_confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="auth-input-field pr-9"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || isOAuthLoading}
                  className="auth-button mt-4"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{isCreate ? "Create Workspace Account" : "Sign In to Library"}</span>
                  )}
                </button>
              </form>

            </div>
          </div>

        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto text-center text-[11px] font-mono text-muted-foreground">
        EduScrapeApp · Class 1–12 Automated Curriculum Platform
      </div>
    </div>
  );
}
