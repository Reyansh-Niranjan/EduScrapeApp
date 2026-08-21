import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  BookMarked,
  BookOpen,
  ChevronRight,
  FileText,
  Flame,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  UserCircle2,
  Search,
  Plus,
  ExternalLink,
  Sparkles,
  Menu,
  X,
  Clock,
  HardDrive,
  Trash2,
  Upload,
  UploadCloud,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import ThemeToggle from "./ThemeToggle";

interface DashboardProps {
  onLogout?: () => void;
}

type DashboardTab = "overview" | "library" | "notes" | "books";

interface UserProfile {
  name: string;
  email: string;
  classLabel: string;
  avatarUrl: string | null;
}

interface StorageItem {
  name: string;
  fullPath: string;
  createdAt: string | null;
  updatedAt: string | null;
  size: number | null;
  mimeType: string | null;
}

const sidebarNav: { id: DashboardTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "library", label: "NCERT Library", icon: BookOpen },
  { id: "notes", label: "Study Notes", icon: FileText },
  { id: "books", label: "Your Bookshelf", icon: BookMarked },
];

const weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];

function SectionLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-purple-500" />
        <p className="mt-4 text-sm font-medium text-[var(--theme-text-secondary)]">Loading {label}...</p>
      </div>
    </div>
  );
}

function formatTitle(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim();
}

function formatBytes(size: number | null) {
  if (size === null || size === undefined) return "Unknown size";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function toDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekCounts(items: StorageItem[]) {
  const counts = [0, 0, 0, 0, 0];
  const now = new Date();

  for (const item of items) {
    const date = toDate(item.createdAt ?? item.updatedAt);
    if (!date) continue;
    if (date.getFullYear() !== now.getFullYear() || date.getMonth() !== now.getMonth()) continue;
    const weekIndex = Math.min(4, Math.floor((date.getDate() - 1) / 7));
    counts[weekIndex] += 1;
  }

  return counts;
}

function getDailyStreak(items: StorageItem[]) {
  const activityDays = new Set(
    items
      .map((item) => toDate(item.createdAt ?? item.updatedAt))
      .filter((date): date is Date => Boolean(date))
      .map((date) => toDateKey(date))
  );

  let streak = 0;
  const cursor = new Date();

  for (let i = 0; i < 365; i += 1) {
    if (!activityDays.has(toDateKey(cursor))) {
      // Allow today to not break streak if yesterday was active
      if (i === 0) {
        cursor.setDate(cursor.getDate() - 1);
        if (activityDays.has(toDateKey(cursor))) {
          streak += 1;
          cursor.setDate(cursor.getDate() - 1);
          continue;
        }
      }
      break;
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return Math.max(1, streak); // Default minimum 1-day starter streak
}

function getLatestItem(items: StorageItem[]) {
  return (
    [...items].sort((a, b) => {
      const aTime = toDate(a.updatedAt ?? a.createdAt)?.getTime() ?? 0;
      const bTime = toDate(b.updatedAt ?? b.createdAt)?.getTime() ?? 0;
      return bTime - aTime;
    })[0] ?? null
  );
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/* =========================================================================
   OVERVIEW SUB-COMPONENT (BENTO-GRID)
   ========================================================================= */
function DashboardOverview({
  profile,
  userBooks,
  libraryBooks,
  onTabChange,
  onRefresh,
}: {
  profile: UserProfile;
  userBooks: StorageItem[];
  libraryBooks: StorageItem[];
  onTabChange: (tab: DashboardTab) => void;
  onRefresh: () => void;
}) {
  const weeklyCounts = getWeekCounts(userBooks);
  const streak = getDailyStreak(userBooks);
  const latestItem = getLatestItem(userBooks) ?? getLatestItem(libraryBooks);
  const classLabel = profile.classLabel || "Class";
  const greeting = getTimeGreeting();

  const totalBytes = userBooks.reduce((sum, item) => sum + (item.size || 0), 0);

  return (
    <motion.div
      className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hero Welcome Banner */}
      <div
        className="relative overflow-hidden rounded-3xl border p-6 sm:p-8 shadow-xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(20, 184, 166, 0.12) 100%), var(--theme-card-bg)",
          borderColor: "var(--theme-border)",
        }}
      >
        {/* Glow circles in banner */}
        <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{classLabel} Student Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--theme-text)] tracking-tight">
              {greeting}, {profile.name}! 👋
            </h1>
            <p className="text-sm sm:text-base text-[var(--theme-text-secondary)] leading-relaxed">
              You are currently on a <strong className="text-[var(--theme-text)]">{streak}-day learning streak</strong>. Explore NCERT curriculum books or manage your personal study materials.
            </p>
          </div>

          {/* Action buttons inside Hero */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onTabChange("library")}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <BookOpen className="h-4 w-4" />
              <span>Explore Library</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange("books")}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "var(--theme-bg)",
                borderColor: "var(--theme-border)",
                color: "var(--theme-text)",
              }}
            >
              <BookMarked className="h-4 w-4 text-teal-400" />
              <span>Your Bookshelf</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Bento Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Activity / Weekly Progress */}
        <div
          className="rounded-3xl border p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-0.5"
          style={{
            background: "var(--theme-card-bg)",
            borderColor: "var(--theme-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">
              Activity / Mo
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[var(--theme-text)]">
                {weeklyCounts.reduce((sum, v) => sum + v, 0)}
              </span>
              <span className="text-xs font-semibold text-[var(--theme-text-secondary)]">files this month</span>
            </div>

            {/* Micro bar chart */}
            <div className="mt-4 flex items-end gap-2 pt-2 border-t border-[var(--theme-border)]">
              {weeklyCounts.map((count, index) => {
                const height = Math.max(12, count * 16 + 12);
                return (
                  <div key={weekLabels[index]} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className="h-16 w-full flex items-end justify-center rounded-lg bg-[var(--theme-bg-secondary)] p-1">
                      <div
                        className="w-full rounded-md bg-gradient-to-t from-purple-600 to-teal-400 transition-all duration-500"
                        style={{ height: `${height}px` }}
                        title={`${weekLabels[index]}: ${count} files`}
                      />
                    </div>
                    <span className="text-[9px] font-medium text-[var(--theme-text-secondary)]">
                      W{index + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Streak */}
        <div
          className="rounded-3xl border p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-0.5"
          style={{
            background: "var(--theme-card-bg)",
            borderColor: "var(--theme-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              <Flame className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
              Active Streak
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[var(--theme-text)]">{streak}</span>
              <span className="text-xs font-semibold text-[var(--theme-text-secondary)]">Days in a row</span>
            </div>
            <p className="mt-2 text-xs text-[var(--theme-text-secondary)]">
              Great momentum! Read a chapter today to extend your streak.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--theme-border)] flex items-center justify-between text-xs text-amber-500 font-semibold">
            <span>🔥 On Fire</span>
            <span>Level 1 Scholar</span>
          </div>
        </div>

        {/* 3. Your Bookshelf */}
        <div
          className="rounded-3xl border p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-0.5"
          style={{
            background: "var(--theme-card-bg)",
            borderColor: "var(--theme-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400">
              <HardDrive className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">
              Private Storage
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[var(--theme-text)]">{userBooks.length}</span>
              <span className="text-xs font-semibold text-[var(--theme-text-secondary)]">Books uploaded</span>
            </div>
            <p className="mt-2 text-xs text-[var(--theme-text-secondary)]">
              {formatBytes(totalBytes)} stored securely in your private cloud.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--theme-border)]">
            <button
              type="button"
              onClick={() => onTabChange("books")}
              className="text-xs font-semibold text-teal-500 hover:text-teal-400 inline-flex items-center gap-1"
            >
              <span>Manage Bookshelf</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 4. NCERT Library Catalog */}
        <div
          className="rounded-3xl border p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-0.5"
          style={{
            background: "var(--theme-card-bg)",
            borderColor: "var(--theme-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">
              NCERT Catalog
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[var(--theme-text)]">{libraryBooks.length}</span>
              <span className="text-xs font-semibold text-[var(--theme-text-secondary)]">Digital Textbooks</span>
            </div>
            <p className="mt-2 text-xs text-[var(--theme-text-secondary)]">
              Complete syllabus curriculum across all subjects.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--theme-border)]">
            <button
              type="button"
              onClick={() => onTabChange("library")}
              className="text-xs font-semibold text-sky-500 hover:text-sky-400 inline-flex items-center gap-1"
            >
              <span>Browse Catalog</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Split: Recent Chapter & Fast Navigation Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Chapter Widget */}
        <div
          className="lg:col-span-8 rounded-3xl border p-6 sm:p-7 shadow-sm space-y-5"
          style={{
            background: "var(--theme-card-bg)",
            borderColor: "var(--theme-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--theme-text)]">
                  Continue Reading
                </h3>
                <p className="text-xs text-[var(--theme-text-secondary)]">
                  Pick up right where you left off
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onRefresh}
              className="p-2 rounded-xl border text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] transition"
              style={{
                borderColor: "var(--theme-border)",
                background: "var(--theme-bg)",
              }}
              title="Refresh files"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {latestItem ? (
            <div
              className="rounded-2xl border p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all"
              style={{
                background: "var(--theme-bg-secondary)",
                borderColor: "var(--theme-border)",
              }}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500/20 to-teal-500/20 text-purple-400 flex-shrink-0">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                    Latest Activity
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-[var(--theme-text)]">
                    {formatTitle(latestItem.name)}
                  </h4>
                  <p className="text-xs text-[var(--theme-text-secondary)]">
                    {formatBytes(latestItem.size)} · {latestItem.mimeType || "PDF Document"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onTabChange("books")}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-purple-600 hover:bg-purple-700 shadow-md transition"
              >
                <span>Open File</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              className="rounded-2xl border border-dashed p-8 text-center"
              style={{ borderColor: "var(--theme-border)" }}
            >
              <BookOpen className="mx-auto h-8 w-8 text-[var(--theme-text-secondary)] opacity-50" />
              <p className="mt-3 text-sm font-semibold text-[var(--theme-text)]">
                No recent book activity
              </p>
              <p className="mt-1 text-xs text-[var(--theme-text-secondary)]">
                Open a chapter from the NCERT Library or upload your first book.
              </p>
              <button
                type="button"
                onClick={() => onTabChange("library")}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-teal-500 hover:bg-teal-600 transition"
              >
                Browse Books Now
              </button>
            </div>
          )}
        </div>

        {/* Quick Launch Hub */}
        <div
          className="lg:col-span-4 rounded-3xl border p-6 sm:p-7 shadow-sm space-y-4"
          style={{
            background: "var(--theme-card-bg)",
            borderColor: "var(--theme-border)",
          }}
        >
          <h3 className="text-base sm:text-lg font-bold text-[var(--theme-text)]">
            Quick Actions
          </h3>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => onTabChange("library")}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition hover:scale-[1.01] hover:border-purple-500/40 group"
              style={{
                background: "var(--theme-bg)",
                borderColor: "var(--theme-border)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--theme-text)]">NCERT Digital Library</p>
                  <p className="text-[11px] text-[var(--theme-text-secondary)]">Class 1-12 syllabus</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--theme-text-secondary)] group-hover:translate-x-0.5 transition" />
            </button>

            <button
              type="button"
              onClick={() => onTabChange("books")}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition hover:scale-[1.01] hover:border-teal-500/40 group"
              style={{
                background: "var(--theme-bg)",
                borderColor: "var(--theme-border)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition">
                  <BookMarked className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--theme-text)]">Upload to Bookshelf</p>
                  <p className="text-[11px] text-[var(--theme-text-secondary)]">Private cloud storage</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--theme-text-secondary)] group-hover:translate-x-0.5 transition" />
            </button>

            <button
              type="button"
              onClick={() => onTabChange("notes")}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition hover:scale-[1.01] hover:border-amber-500/40 group"
              style={{
                background: "var(--theme-bg)",
                borderColor: "var(--theme-border)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--theme-text)]">Study Notes & Notepad</p>
                  <p className="text-[11px] text-[var(--theme-text-secondary)]">Keep summary takeaways</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--theme-text-secondary)] group-hover:translate-x-0.5 transition" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================================
   LIBRARY SUB-COMPONENT
   ========================================================================= */
function LibrarySection({ items }: { items: StorageItem[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  return (
    <motion.div
      className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--theme-text)]">NCERT Library</h2>
          <p className="text-xs sm:text-sm text-[var(--theme-text-secondary)] mt-1">
            Free digital textbooks and learning resources for all subjects
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--theme-text-secondary)]" />
          <input
            type="text"
            placeholder="Search textbooks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="auth-input-field pl-9 text-xs sm:text-sm"
          />
        </div>
      </div>

      {filtered.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const publicUrl = supabase.storage.from("ncert").getPublicUrl(item.fullPath).data.publicUrl;
            return (
              <div
                key={item.fullPath}
                className="rounded-3xl border p-5 shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-md hover:-translate-y-1"
                style={{
                  background: "var(--theme-card-bg)",
                  borderColor: "var(--theme-border)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 flex-shrink-0">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400">
                    NCERT
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[var(--theme-text)] line-clamp-2">
                    {formatTitle(item.name)}
                  </h3>
                  <p className="text-xs text-[var(--theme-text-secondary)] mt-1">
                    {formatBytes(item.size)}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--theme-border)] flex items-center justify-between">
                  <span className="text-[11px] text-[var(--theme-text-secondary)]">PDF Document</span>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs text-white bg-sky-600 hover:bg-sky-500 transition"
                  >
                    <span>Read Book</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="rounded-3xl border border-dashed p-12 text-center"
          style={{ borderColor: "var(--theme-border)" }}
        >
          <BookOpen className="mx-auto h-10 w-10 text-[var(--theme-text-secondary)] opacity-40" />
          <p className="mt-4 text-base font-semibold text-[var(--theme-text)]">
            {search ? "No matching books found" : "No NCERT files loaded"}
          </p>
          <p className="mt-1 text-xs text-[var(--theme-text-secondary)]">
            {search ? "Try searching for a different keyword" : "Files in the NCERT bucket will show up here."}
          </p>
        </div>
      )}
    </motion.div>
  );
}

/* =========================================================================
   BOOKSHELF SUB-COMPONENT (WITH DIRECT PDF UPLOADER)
   ========================================================================= */
function BooksSection({
  items,
  onRefresh,
}: {
  items: StorageItem[];
  onRefresh?: () => void;
}) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const handleFileSelect = (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Only PDF files are supported.");
      return;
    }
    setSelectedFile(file);
    setCustomTitle(file.name.replace(/\.pdf$/i, ""));
    setErrorMessage(null);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage("Please select a PDF file to upload.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id ?? "anonymous";
      const cleanTitle = (customTitle.trim() || selectedFile.name.replace(/\.pdf$/i, "")).replace(/[^a-zA-Z0-9_-]/g, "_");
      const filePath = `${userId}/${Date.now()}_${cleanTitle}.pdf`;

      const { error } = await supabase.storage
        .from("user-books")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: true,
          contentType: "application/pdf",
        });

      if (error) throw error;

      setSuccessMessage("PDF uploaded to your bookshelf!");
      setSelectedFile(null);
      setCustomTitle("");
      if (onRefresh) onRefresh();

      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMessage(null);
      }, 1200);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--theme-text)]">Your Bookshelf</h2>
          <p className="text-xs sm:text-sm text-[var(--theme-text-secondary)] mt-1">
            Private files and custom PDF study materials stored in your cloud
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--theme-text-secondary)]" />
            <input
              type="text"
              placeholder="Search your books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="auth-input-field pl-9 text-xs sm:text-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setIsModalOpen(true);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-md shadow-teal-500/20 transition hover:scale-[1.02]"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload PDF</span>
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-3xl border p-6 sm:p-8 shadow-2xl space-y-5"
              style={{
                background: "var(--theme-card-bg)",
                borderColor: "var(--theme-border)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--theme-text)]">Upload Study PDF</h3>
                    <p className="text-xs text-[var(--theme-text-secondary)]">Save custom notes or books to your cloud</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* Drag and drop box */}
                <label
                  className="border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition hover:border-teal-500/50 hover:bg-teal-500/5"
                  style={{ borderColor: "var(--theme-border)" }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) {
                      handleFileSelect(e.dataTransfer.files[0]);
                    }
                  }}
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  />
                  <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400 mb-3">
                    <FileText className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-[var(--theme-text)] text-center">
                    {selectedFile ? selectedFile.name : "Click to browse or drag & drop PDF"}
                  </p>
                  <p className="text-xs text-[var(--theme-text-secondary)] mt-1">
                    {selectedFile ? `${formatBytes(selectedFile.size)} selected` : "Supported formats: PDF (up to 50MB)"}
                  </p>
                </label>

                {/* Custom Title Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--theme-text-secondary)]">
                    Display Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Organic Chemistry Short Notes"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="auth-input-field text-sm"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !selectedFile}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Save to Bookshelf</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Book Grid */}
      {filtered.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.fullPath}
              className="rounded-3xl border p-5 shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-md hover:-translate-y-1"
              style={{
                background: "var(--theme-card-bg)",
                borderColor: "var(--theme-border)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 flex-shrink-0">
                  <BookMarked className="h-6 w-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400">
                  Private
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[var(--theme-text)] line-clamp-2">
                  {formatTitle(item.name)}
                </h3>
                <p className="text-xs text-[var(--theme-text-secondary)] mt-1">
                  {formatBytes(item.size)}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--theme-border)] flex items-center justify-between">
                <span className="text-[11px] text-[var(--theme-text-secondary)]">
                  {toDate(item.createdAt ?? item.updatedAt)?.toLocaleDateString() ?? "Uploaded"}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    const { data } = await supabase.storage
                      .from("user-books")
                      .createSignedUrl(item.fullPath, 60 * 60);
                    if (data?.signedUrl) {
                      window.open(data.signedUrl, "_blank", "noreferrer");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs text-white bg-teal-600 hover:bg-teal-500 transition"
                >
                  <span>Open PDF</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="rounded-3xl border border-dashed p-12 text-center"
          style={{ borderColor: "var(--theme-border)" }}
        >
          <BookMarked className="mx-auto h-10 w-10 text-[var(--theme-text-secondary)] opacity-40" />
          <p className="mt-4 text-base font-semibold text-[var(--theme-text)]">
            {search ? "No matching files" : "Your bookshelf is empty"}
          </p>
          <p className="mt-1 text-xs text-[var(--theme-text-secondary)]">
            Upload custom PDFs to your private cloud storage to read and study them anytime.
          </p>
          <button
            type="button"
            onClick={() => {
              setIsModalOpen(true);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-md shadow-teal-500/20 transition hover:scale-105"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Your First PDF</span>
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* =========================================================================
   STUDY NOTES SUB-COMPONENT
   ========================================================================= */
function NotesSection() {
  const [notes, setNotes] = useState<Array<{ id: string; title: string; content: string; date: string }>>(() => {
    try {
      const saved = localStorage.getItem("eduscrape_local_notes");
      return saved ? JSON.parse(saved) : [
        {
          id: "1",
          title: "Physics - Optics Formulas",
          content: "• Snell's Law: n1 * sin(θ1) = n2 * sin(θ2)\n• Lens Formula: 1/f = 1/v - 1/u\n• Magnification: m = v/u",
          date: new Date().toLocaleDateString(),
        },
      ];
    } catch {
      return [];
    }
  });

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const saveNotes = (updated: typeof notes) => {
    setNotes(updated);
    localStorage.setItem("eduscrape_local_notes", JSON.stringify(updated));
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newNote = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      content: newContent.trim(),
      date: new Date().toLocaleDateString(),
    };
    saveNotes([newNote, ...notes]);
    setNewTitle("");
    setNewContent("");
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    saveNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <motion.div
      className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--theme-text)]">Study Notes</h2>
          <p className="text-xs sm:text-sm text-[var(--theme-text-secondary)] mt-1">
            Capture revision notes, key formulas, and chapter summaries
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-purple-600 hover:bg-purple-700 transition self-start"
        >
          <Plus className="h-4 w-4" />
          <span>{isAdding ? "Cancel" : "New Note"}</span>
        </button>
      </div>

      {/* Add note panel */}
      {isAdding && (
        <form
          onSubmit={handleAddNote}
          className="p-6 rounded-3xl border shadow-lg space-y-4"
          style={{
            background: "var(--theme-card-bg)",
            borderColor: "var(--theme-border)",
          }}
        >
          <h3 className="text-base font-bold text-[var(--theme-text)]">Create Study Note</h3>
          <input
            type="text"
            placeholder="Note title (e.g. Chapter 4 Key Concepts)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="auth-input-field text-sm"
            required
          />
          <textarea
            placeholder="Write your study notes, formulas, or takeaways here..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={4}
            className="auth-input-field text-sm resize-none"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600"
            >
              Save Note
            </button>
          </div>
        </form>
      )}

      {/* Notes Grid */}
      {notes.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-3xl border p-5 shadow-sm flex flex-col justify-between gap-4 transition hover:shadow-md"
              style={{
                background: "var(--theme-card-bg)",
                borderColor: "var(--theme-border)",
              }}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-base font-bold text-[var(--theme-text)]">{note.title}</h4>
                  <button
                    type="button"
                    onClick={() => handleDelete(note.id)}
                    className="p-1 rounded-lg text-[var(--theme-text-secondary)] hover:text-red-500 transition"
                    title="Delete Note"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-[var(--theme-text-secondary)] whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--theme-border)] text-[11px] text-[var(--theme-text-secondary)]">
                Saved on {note.date}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="rounded-3xl border border-dashed p-12 text-center"
          style={{ borderColor: "var(--theme-border)" }}
        >
          <FileText className="mx-auto h-10 w-10 text-[var(--theme-text-secondary)] opacity-40" />
          <p className="mt-4 text-base font-semibold text-[var(--theme-text)]">
            No notes written yet
          </p>
          <p className="mt-1 text-xs text-[var(--theme-text-secondary)]">
            Click &ldquo;New Note&rdquo; above to write and keep study takeaways.
          </p>
        </div>
      )}
    </motion.div>
  );
}

/* =========================================================================
   STORAGE LOADER
   ========================================================================= */
async function listStorageItems(bucket: string) {
  const collected: StorageItem[] = [];

  const walk = async (path = "", depth = 0) => {
    const { data, error } = await supabase.storage.from(bucket).list(path, {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) throw error;

    for (const item of data ?? []) {
      const fullPath = path ? `${path}/${item.name}` : item.name;
      const metadata = item.metadata && typeof item.metadata === "object" ? item.metadata : null;
      const isFolder = metadata === null && !/\.[a-z0-9]+$/i.test(item.name) && depth < 3;

      if (isFolder) {
        await walk(fullPath, depth + 1);
        continue;
      }

      collected.push({
        name: item.name,
        fullPath,
        createdAt: item.created_at ?? null,
        updatedAt: item.updated_at ?? null,
        size: typeof metadata?.size === "number" ? metadata.size : null,
        mimeType: typeof metadata?.mimetype === "string" ? metadata.mimetype : null,
      });
    }
  };

  await walk();

  return collected.sort((a, b) => {
    const aTime = toDate(a.updatedAt ?? a.createdAt)?.getTime() ?? 0;
    const bTime = toDate(b.updatedAt ?? b.createdAt)?.getTime() ?? 0;
    return bTime - aTime;
  });
}

/* =========================================================================
   MAIN DASHBOARD COMPONENT
   ========================================================================= */
export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userBooks, setUserBooks] = useState<StorageItem[]>([]);
  const [libraryBooks, setLibraryBooks] = useState<StorageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const user = userData.user;
      if (user) {
        const meta = user.user_metadata ?? {};
        setUserProfile({
          name: meta.full_name || meta.name || user.email?.split("@")[0] || "Student",
          email: user.email || "",
          classLabel: meta.grade ? `Class ${meta.grade}` : "Class 10",
          avatarUrl: meta.avatar_url || meta.picture || null,
        });
      }

      const [privateBooks, publicBooks] = await Promise.all([
        listStorageItems("user-books").catch(() => []),
        listStorageItems("ncert").catch(() => []),
      ]);

      setUserBooks(privateBooks);
      setLibraryBooks(publicBooks);
    } catch {
      setUserBooks([]);
      setLibraryBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout?.();
  };

  if (loading || !userProfile) {
    return <SectionLoader label="dashboard" />;
  }

  const streak = getDailyStreak(userBooks);

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] flex">
      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar (Desktop Pinned + Mobile Slide-Over) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col border-r transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "var(--theme-card-bg)",
          borderColor: "var(--theme-border)",
        }}
      >
        {/* Brand Header */}
        <div className="p-6 flex items-center justify-between border-b border-[var(--theme-border)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-teal-500 text-white shadow-lg shadow-purple-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[var(--theme-text)]">
                EduScrape<span className="text-purple-500">App</span>
              </span>
              <p className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">Dashboard</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 rounded-lg text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {sidebarNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "text-white bg-gradient-to-r from-purple-600 to-purple-700 shadow-md shadow-purple-500/20"
                    : "text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-secondary)] hover:text-[var(--theme-text)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[var(--theme-border)] space-y-4">
          <div className="flex items-center justify-between px-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl text-[var(--theme-text-secondary)] hover:text-red-500 hover:bg-red-500/10 transition"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* User Profile Mini-Badge */}
          <div
            className="flex items-center gap-3 p-2.5 rounded-2xl border"
            style={{
              background: "var(--theme-bg-secondary)",
              borderColor: "var(--theme-border)",
            }}
          >
            <div className="relative flex-shrink-0">
              {userProfile.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="h-10 w-10 rounded-full object-cover border"
                  style={{ borderColor: "var(--theme-border)" }}
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-teal-400 text-white font-bold text-sm shadow-inner">
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[var(--theme-card-bg)]" />
            </div>

            <div className="overflow-hidden text-left">
              <p className="truncate text-xs font-bold text-[var(--theme-text)]">
                {userProfile.name}
              </p>
              <p className="text-[10px] font-medium text-[var(--theme-text-secondary)] uppercase tracking-wider">
                {userProfile.classLabel}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar header */}
        <header
          className="sticky top-0 z-30 flex h-16 sm:h-20 items-center justify-between border-b px-4 sm:px-8 backdrop-blur-xl"
          style={{
            background: "var(--theme-bg)",
            borderColor: "var(--theme-border)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl border text-[var(--theme-text)] lg:hidden"
              style={{
                background: "var(--theme-card-bg)",
                borderColor: "var(--theme-border)",
              }}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-base sm:text-xl font-bold capitalize text-[var(--theme-text)]">
              {activeTab === "overview" ? "Dashboard" : activeTab}
            </h2>
          </div>

          {/* Quick status chips on top bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Flame className="h-3.5 w-3.5" />
              <span>{streak}d Streak</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{libraryBooks.length} NCERT</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <UserCircle2 className="h-3.5 w-3.5" />
              <span>{userProfile.classLabel}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "overview" ? (
            <DashboardOverview
              profile={userProfile}
              userBooks={userBooks}
              libraryBooks={libraryBooks}
              onTabChange={setActiveTab}
              onRefresh={fetchData}
            />
          ) : activeTab === "library" ? (
            <LibrarySection items={libraryBooks} />
          ) : activeTab === "notes" ? (
            <NotesSection />
          ) : activeTab === "books" ? (
            <BooksSection items={userBooks} onRefresh={fetchData} />
          ) : null}
        </main>
      </div>
    </div>
  );
}


