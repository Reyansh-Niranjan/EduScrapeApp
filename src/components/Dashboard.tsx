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
import { PdfReader } from "./PdfReader";
import { NestedLibrary } from "./NestedLibrary";

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

const tabTitles: Record<DashboardTab, string> = {
  overview: "Dashboard",
  library: "NCERT Digital Library",
  notes: "Study Notes",
  books: "Your Bookshelf",
};

const weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];

function SectionLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-border border-t-foreground" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">Loading {label}...</p>
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
  onOpenPdf,
}: {
  profile: UserProfile;
  userBooks: StorageItem[];
  libraryBooks: StorageItem[];
  onTabChange: (tab: DashboardTab) => void;
  onRefresh: () => void;
  onOpenPdf?: (url: string, title: string, className?: string, subject?: string) => void;
}) {
  const weeklyCounts = getWeekCounts(userBooks);
  const streak = getDailyStreak(userBooks);
  const latestItem = getLatestItem(userBooks) ?? getLatestItem(libraryBooks);
  const classLabel = profile.classLabel || "Class";
  const greeting = getTimeGreeting();

  const totalBytes = userBooks.reduce((sum, item) => sum + (item.size || 0), 0);

  return (
    <motion.div
      className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Distilled Welcome Banner */}
      <div className="rounded-md border border-border bg-card p-6 sm:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-5 shadow-xs">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{classLabel} Student Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {greeting}, {profile.name}.
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {streak > 1
              ? `${streak}-day learning streak active. Read daily to build consistent mastery.`
              : "Explore NCERT curriculum textbooks or manage your private study files below."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onTabChange("library")}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md font-medium text-xs text-primary-foreground bg-primary hover:opacity-90 transition-opacity active:scale-[0.98] cursor-pointer shadow-xs"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Browse Catalog</span>
          </button>
        </div>
      </div>

      {/* 4 Distilled Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Activity / Monthly Progress */}
        <div className="rounded-md border border-border bg-card p-5 flex flex-col justify-between transition-transform hover:-translate-y-px">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-foreground">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Activity / Mo
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-foreground font-mono">
                {weeklyCounts.reduce((sum, v) => sum + v, 0)}
              </span>
              <span className="text-xs text-muted-foreground">files processed</span>
            </div>

            {/* Micro bar chart */}
            <div className="mt-3 flex items-end gap-1.5 pt-2 border-t border-border">
              {weeklyCounts.map((count, index) => {
                const isZero = count === 0;
                const height = Math.max(6, count * 14 + (isZero ? 6 : 8));
                return (
                  <div key={weekLabels[index]} className="flex flex-1 flex-col items-center gap-1">
                    <div className="h-12 w-full flex items-end justify-center rounded-xs bg-secondary/70 p-0.5 border-b border-border/80">
                      <div
                        className={`w-full rounded-xs transition-all duration-300 ${
                          isZero ? "bg-muted-foreground/25" : "bg-foreground/80"
                        }`}
                        style={{ height: `${height}px` }}
                        title={`${weekLabels[index]}: ${count > 0 ? `${count} files` : "No reading activity"}`}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      W{index + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Active Streak */}
        <div className="rounded-md border border-border bg-card p-5 flex flex-col justify-between transition-transform hover:-translate-y-px">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--pastel-amber-bg)] text-[var(--pastel-amber-text)]">
              <Flame className="h-4 w-4" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--pastel-amber-text)]">
              Active Streak
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-foreground font-mono">{streak}</span>
              <span className="text-xs text-muted-foreground">consecutive days</span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Read any chapter today to maintain your daily streak.
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-xs font-mono text-[var(--pastel-amber-text)] font-semibold">
            <span className="inline-flex items-center gap-1"><Flame className="h-3 w-3" /> Streak Active</span>
            <span className="text-xs uppercase text-muted-foreground font-normal">Daily</span>
          </div>
        </div>

        {/* 3. Your Bookshelf */}
        <div className="rounded-md border border-border bg-card p-5 flex flex-col justify-between transition-transform hover:-translate-y-px">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-foreground">
              <HardDrive className="h-4 w-4" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Private Cloud
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-foreground font-mono">{userBooks.length}</span>
              <span className="text-xs text-muted-foreground">custom files</span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {formatBytes(totalBytes)} stored in private cloud.
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-border">
            <button
              type="button"
              onClick={() => onTabChange("books")}
              className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Open Bookshelf</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 4. NCERT Library Catalog */}
        <div className="rounded-md border border-border bg-card p-5 flex flex-col justify-between transition-transform hover:-translate-y-px">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-foreground">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              NCERT Catalog
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-foreground font-mono">{libraryBooks.length}</span>
              <span className="text-xs text-muted-foreground">textbooks ready</span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Class 1–12 full curriculum coverage.
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-border">
            <button
              type="button"
              onClick={() => onTabChange("library")}
              className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Explore Library</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Split: Continue Reading & Fast Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Continue Reading (8 cols) */}
        <div className="lg:col-span-8 rounded-md border border-border bg-card p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-bold text-foreground">
                Continue Reading
              </h2>
            </div>

            <button
              type="button"
              onClick={onRefresh}
              aria-label="Refresh files"
              className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
              title="Refresh files"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          {latestItem ? (
            <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-foreground shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Latest Activity
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                    {formatTitle(latestItem.name)}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    {formatBytes(latestItem.size)} · {latestItem.mimeType || "PDF Document"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  if (libraryBooks.some((b) => b.fullPath === latestItem.fullPath)) {
                    const pubUrl = supabase.storage.from("ncert").getPublicUrl(latestItem.fullPath).data.publicUrl;
                    onOpenPdf?.(pubUrl, formatTitle(latestItem.name), "NCERT", "Textbook");
                  } else {
                    const { data } = await supabase.storage.from("user-books").createSignedUrl(latestItem.fullPath, 3600);
                    if (data?.signedUrl) {
                      onOpenPdf?.(data.signedUrl, formatTitle(latestItem.name), "Custom Upload", "My Bookshelf");
                    }
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-md font-medium text-xs text-primary-foreground bg-primary hover:opacity-90 transition-opacity shrink-0 cursor-pointer shadow-xs"
              >
                <span>Open in Reader</span>
                <BookOpen className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="pt-6 pb-2 border-t border-border text-center space-y-2">
              <BookOpen className="mx-auto h-7 w-7 text-muted-foreground opacity-40" />
              <p className="text-xs font-semibold text-foreground">
                No recent reading session
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Open a chapter from the library to resume reading here anytime.
              </p>
              <button
                type="button"
                onClick={() => onTabChange("library")}
                className="mt-2 inline-flex items-center px-3.5 py-1.5 rounded-md text-xs font-medium text-primary-foreground bg-primary hover:opacity-90 transition-opacity cursor-pointer"
              >
                Open NCERT Library
              </button>
            </div>
          )}
        </div>

        {/* Quick Launch Hub (4 cols) */}
        <div className="lg:col-span-4 rounded-md border border-border bg-card p-5 sm:p-6 space-y-3">
          <h2 className="text-sm font-bold text-foreground">
            Quick Actions
          </h2>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onTabChange("library")}
              className="w-full flex items-center justify-between p-2.5 rounded-md border border-border bg-secondary/30 text-left transition-colors hover:bg-secondary hover:border-muted-foreground group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-card border border-border text-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Browse {classLabel}</p>
                  <p className="text-xs text-muted-foreground">Syllabus textbooks</p>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => onTabChange("books")}
              className="w-full flex items-center justify-between p-2.5 rounded-md border border-border bg-secondary/30 text-left transition-colors hover:bg-secondary hover:border-muted-foreground group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-card border border-border text-foreground">
                  <Upload className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Upload Custom PDF</p>
                  <p className="text-xs text-muted-foreground">Save to cloud storage</p>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => onTabChange("notes")}
              className="w-full flex items-center justify-between p-2.5 rounded-md border border-border bg-secondary/30 text-left transition-colors hover:bg-secondary hover:border-muted-foreground group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-card border border-border text-foreground">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">New Study Note</p>
                  <p className="text-xs text-muted-foreground">Take revision notes</p>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================================
   BOOKSHELF SUB-COMPONENT (WITH DIRECT PDF UPLOADER)
   ========================================================================= */
function BooksSection({
  items,
  onRefresh,
  onOpenPdf,
}: {
  items: StorageItem[];
  onRefresh?: () => void;
  onOpenPdf: (url: string, title: string, className?: string, subject?: string) => void;
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
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Your Bookshelf</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Private files and custom PDF study materials stored in your cloud
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
            className="flex-shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium text-primary-foreground bg-primary hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload PDF</span>
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Upload PDF"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-md border border-border bg-card p-6 sm:p-8 space-y-5 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-md bg-secondary text-foreground">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Upload Study PDF</h3>
                    <p className="text-xs text-muted-foreground">Save private textbook or notes to cloud</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close upload dialog"
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-md bg-[var(--pastel-red-bg)] border border-destructive/30 text-[var(--pastel-red-text)] text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-2.5 rounded-md bg-[var(--pastel-green-bg)] border border-border text-[var(--pastel-green-text)] text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* Drag and drop box */}
                <label
                  className="border-2 border-dashed border-border rounded-md p-8 flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-muted-foreground hover:bg-secondary/50"
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
                  <div className="p-3 rounded-md bg-secondary text-foreground mb-3">
                    <FileText className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-foreground text-center">
                    {selectedFile ? selectedFile.name : "Click to select or drop PDF"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedFile ? `${formatBytes(selectedFile.size)} selected` : "PDF format up to 50MB"}
                  </p>
                </label>

                {/* Custom Title Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Display Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Class 10 Chemistry Formulas"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="auth-input-field text-sm"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-2 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !selectedFile}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium text-primary-foreground bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer shadow-xs"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.fullPath}
              className="rounded-md border border-border bg-card p-4 sm:p-5 flex flex-col justify-between gap-4 transition-transform hover:-translate-y-px"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-foreground flex-shrink-0">
                  <BookMarked className="h-4 w-4" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {formatBytes(item.size)}
                </span>
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground line-clamp-2">
                  {formatTitle(item.name)}
                </h3>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">
                  {toDate(item.createdAt ?? item.updatedAt)?.toLocaleDateString() ?? "Uploaded"}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    const { data } = await supabase.storage
                      .from("user-books")
                      .createSignedUrl(item.fullPath, 60 * 60);
                    if (data?.signedUrl) {
                      onOpenPdf(data.signedUrl, formatTitle(item.name), "Custom Upload", "My Bookshelf");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs text-primary-foreground bg-primary hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                >
                  <span>Open</span>
                  <BookOpen className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border p-10 text-center">
          <BookMarked className="mx-auto h-8 w-8 text-muted-foreground opacity-40" />
          <p className="mt-3 text-sm font-semibold text-foreground">
            {search ? "No matching files" : "Your bookshelf is empty"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Upload custom PDFs to your private cloud storage to study anytime.
          </p>
          <button
            type="button"
            onClick={() => {
              setIsModalOpen(true);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium text-primary-foreground bg-primary hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Upload First PDF</span>
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
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Study Notes</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Capture revision notes, key formulas, and chapter summaries
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md font-medium text-xs text-primary-foreground bg-primary hover:opacity-90 transition-opacity self-start cursor-pointer shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>{isAdding ? "Cancel" : "New Note"}</span>
        </button>
      </div>

      {/* Add note panel */}
      {isAdding && (
        <form
          onSubmit={handleAddNote}
          className="p-5 sm:p-6 rounded-md border border-border bg-card shadow-xs space-y-4"
        >
          <h3 className="text-sm font-bold text-foreground">Create Study Note</h3>
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
          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-md text-xs font-medium text-primary-foreground bg-primary hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              Save Note
            </button>
          </div>
        </form>
      )}

      {/* Notes Grid */}
      {notes.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-md border border-border bg-card p-4 sm:p-5 flex flex-col justify-between gap-4 transition-transform hover:-translate-y-px"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-foreground">{note.title}</h4>
                  <button
                    type="button"
                    onClick={() => handleDelete(note.id)}
                    aria-label={`Delete note: ${note.title}`}
                    className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors cursor-pointer"
                    title="Delete Note"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              </div>

              <div className="pt-2.5 border-t border-border text-xs font-mono text-muted-foreground">
                Saved {note.date}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border p-10 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground opacity-40" />
          <p className="mt-3 text-sm font-semibold text-foreground">
            No notes written yet
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Click &ldquo;New Note&rdquo; above to record key concepts.
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
  const [activePdf, setActivePdf] = useState<{
    url: string;
    title: string;
    className?: string;
    subject?: string;
  } | null>(null);

  const handleOpenPdf = (url: string, title: string, className?: string, subject?: string) => {
    setActivePdf({ url, title, className, subject });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();

      const user = userData?.user;
      if (user) {
        const meta = user.user_metadata ?? {};
        setUserProfile({
          name: meta.full_name || meta.name || user.email?.split("@")[0] || "Student",
          email: user.email || "",
          classLabel: meta.grade ? `Class ${meta.grade}` : "Class 10",
          avatarUrl: meta.avatar_url || meta.picture || null,
        });
      } else {
        setUserProfile({
          name: "Guest Student",
          email: "student@eduscrapeapp.dev",
          classLabel: "Class 10",
          avatarUrl: null,
        });
      }

      const timeoutPromise = new Promise<StorageItem[]>((_, reject) =>
        setTimeout(() => reject(new Error("Storage timeout")), 3000)
      );

      const [privateBooks, publicBooks] = await Promise.all([
        Promise.race([listStorageItems("user-books"), timeoutPromise]).catch(() => []),
        Promise.race([listStorageItems("ncert"), timeoutPromise]).catch(() => []),
      ]);

      setUserBooks(privateBooks);
      setLibraryBooks(publicBooks);
    } catch {
      setUserProfile({
        name: "Guest Student",
        email: "student@eduscrapeapp.dev",
        classLabel: "Class 10",
        avatarUrl: null,
      });
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
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar (Desktop Pinned + Mobile Slide-Over) */}
      <aside
        id="dashboard-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col border-r border-border bg-card transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background font-mono font-bold text-xs">
              E
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-foreground">
                EduScrapeApp
              </span>
              <p className="text-xs font-mono uppercase text-muted-foreground tracking-wider">Workspace</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close navigation"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary lg:hidden transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-foreground text-background font-semibold"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border space-y-3">
          <div className="flex items-center justify-between px-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* User Profile Mini-Badge */}
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-md bg-secondary/50">
            <div className="relative flex-shrink-0">
              {userProfile.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="h-8 w-8 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background font-bold text-xs font-mono">
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
            </div>

            <div className="overflow-hidden text-left">
              <p className="truncate text-xs font-bold text-foreground">
                {userProfile.name}
              </p>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                {userProfile.classLabel}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation"
              aria-expanded={isMobileMenuOpen}
              aria-controls="dashboard-sidebar"
              className="p-1.5 rounded-md border border-border bg-card text-foreground lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              {tabTitles[activeTab]}
            </h2>
          </div>

          {/* Quick status chips on top bar */}
          <div className="flex items-center gap-2 sm:gap-3 font-mono">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-[var(--pastel-amber-bg)] text-[var(--pastel-amber-text)] border border-border">
              <Flame className="h-3.5 w-3.5" />
              <span>{streak}d Streak</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-secondary text-muted-foreground border border-border">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{libraryBooks.length} NCERT</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-secondary text-muted-foreground border border-border">
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
              onOpenPdf={handleOpenPdf}
            />
          ) : activeTab === "library" ? (
            <NestedLibrary
              items={libraryBooks}
              userClass={userProfile.classLabel}
              onOpenPdf={handleOpenPdf}
            />
          ) : activeTab === "notes" ? (
            <NotesSection />
          ) : activeTab === "books" ? (
            <BooksSection items={userBooks} onRefresh={fetchData} onOpenPdf={handleOpenPdf} />
          ) : null}
        </main>
      </div>

      {/* Fullscreen In-App PDF.js Reader Modal */}
      <PdfReader
        isOpen={Boolean(activePdf)}
        onClose={() => setActivePdf(null)}
        pdfUrl={activePdf?.url || ""}
        title={activePdf?.title || ""}
        className={activePdf?.className}
        subject={activePdf?.subject}
      />
    </div>
  );
}
