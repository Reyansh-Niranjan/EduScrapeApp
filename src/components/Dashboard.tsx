import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookMarked,
  BookOpen,
  CalendarDays,
  ChevronRight,
  FileText,
  Flame,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  UserCircle2,
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
  { id: "library", label: "Library", icon: BookOpen },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "books", label: "Your Books", icon: BookMarked },
];

const weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];

function SectionLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-teal-400" />
        <p className="mt-4 text-sm text-[var(--theme-text-secondary)]">Loading {label}...</p>
      </div>
    </div>
  );
}

function formatTitle(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim();
}

function formatBytes(size: number | null) {
  if (size === null) return "Unknown size";
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
    if (!activityDays.has(toDateKey(cursor))) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
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

function Card({
  icon: Icon,
  title,
  value,
  subtitle,
  tone,
  children,
}: {
  icon: typeof BarChart3;
  title: string;
  value: string;
  subtitle?: string;
  tone: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.article
      className="flex flex-col justify-between rounded-2xl border border-[#1F2A3D] bg-[rgba(16,28,44,0.78)] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-1"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${tone}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--theme-text-secondary)]">{title}</p>
          <p className="mt-1 text-2xl font-bold text-[var(--theme-text)]">{value}</p>
        </div>
      </div>
      {children}
      {subtitle ? <p className="mt-2 text-xs text-[var(--theme-text-secondary)]">{subtitle}</p> : null}
    </motion.article>
  );
}

function FileCard({
  title,
  subtitle,
  size,
  href,
  accent,
}: {
  title: string;
  subtitle: string;
  size: string;
  href?: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-[#1F2A3D] bg-[rgba(7,18,31,0.72)] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--theme-text)]">{title}</p>
          <p className="mt-1 text-xs text-[var(--theme-text-secondary)]">{subtitle}</p>
        </div>
        <div className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${accent}`}>File</div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4 text-xs text-[var(--theme-text-secondary)]">
        <span>{size}</span>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-teal-300 transition-colors hover:text-teal-200"
          >
            Open <ChevronRight className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#24344b] bg-[rgba(7,18,31,0.48)] p-8 text-center">
      <p className="text-lg font-semibold text-[var(--theme-text)]">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--theme-text-secondary)]">{message}</p>
    </div>
  );
}

function DashboardOverview({
  profile,
  userBooks,
  libraryBooks,
  onTabChange,
}: {
  profile: UserProfile;
  userBooks: StorageItem[];
  libraryBooks: StorageItem[];
  onTabChange: (tab: DashboardTab) => void;
}) {
  const weeklyCounts = getWeekCounts(userBooks);
  const streak = getDailyStreak(userBooks);
  const latestItem = getLatestItem(userBooks) ?? getLatestItem(libraryBooks);
  const classLabel = profile.classLabel || "Class";

  return (
    <motion.div
      className="px-8 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <motion.header
          className="relative overflow-hidden rounded-2xl border border-[#1F2A3D] bg-[rgba(16,28,44,0.78)] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-md"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.18),transparent_42%),radial-gradient(circle_at_left,rgba(139,92,246,0.18),transparent_38%)]" />
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--theme-text)] md:text-4xl">Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-[var(--theme-text-secondary)]">
                Track your books, browse the NCERT library, and continue from the last chapter you opened.
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-[#24344b] bg-[#0b1726]/70 px-4 py-3 backdrop-blur-sm">
              <div className="relative flex-shrink-0">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="h-12 w-12 rounded-full border border-[#24344b] object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#24344b] bg-[linear-gradient(135deg,rgba(20,184,166,0.2),rgba(139,92,246,0.2))] text-teal-200">
                    <UserCircle2 className="h-7 w-7" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--theme-text)]">{profile.name}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-[var(--theme-text-secondary)]">
                  <span>{classLabel}</span>
                  <span className="h-1 w-1 rounded-full bg-[var(--theme-text-secondary)]/60" />
                  <span>{profile.email}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        <motion.section
          className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <Card
            icon={BarChart3}
            title="Chapters/mo"
            value={String(weeklyCounts.reduce((sum, value) => sum + value, 0))}
            subtitle="Week based for the current month"
            tone="bg-purple-500/10 text-purple-300"
          >
            <div className="mt-2 flex items-end gap-3">
              {weeklyCounts.map((count, index) => {
                const height = Math.max(16, count * 18 + 16);
                return (
                  <div key={weekLabels[index]} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-28 w-full items-end rounded-xl bg-[#122131] px-2 py-2">
                      <div
                        className="w-full rounded-lg bg-gradient-to-t from-teal-500 to-cyan-400 transition-all"
                        style={{ height: `${height}px` }}
                      />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--theme-text-secondary)]">{weekLabels[index]}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card
            icon={Flame}
            title="BPD streak"
            value={String(streak)}
            subtitle="Books per Day streak"
            tone="bg-amber-500/10 text-amber-300"
          />

          <Card
            icon={BookOpen}
            title="Your Books"
            value={String(userBooks.length)}
            subtitle="Uploaded to your private bucket"
            tone="bg-emerald-500/10 text-emerald-300"
          />

          <Card
            icon={BookMarked}
            title="Last Chapter"
            value={latestItem ? formatTitle(latestItem.name) : "None"}
            subtitle={latestItem ? `Updated ${toDate(latestItem.updatedAt ?? latestItem.createdAt)?.toLocaleDateString() ?? "recently"}` : "Open a book to populate this card"}
            tone="bg-sky-500/10 text-sky-300"
          />
        </motion.section>

        <div className="grid gap-6 xl:grid-cols-12">
          <motion.section
            className="xl:col-span-8 rounded-2xl border border-[#1F2A3D] bg-[rgba(16,28,44,0.78)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
          >
            <div className="flex items-center justify-between border-b border-[#1F2A3D]/70 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-[var(--theme-text)]">Last Chapter</h2>
                <p className="mt-1 text-sm text-[var(--theme-text-secondary)]">The most recent book file you opened or uploaded.</p>
              </div>
              <button
                type="button"
                onClick={() => onTabChange("books")}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-4 py-2 text-sm font-semibold text-[#051424] transition-colors hover:bg-teal-300"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            <div className="p-6">
              {latestItem ? (
                <div className="rounded-2xl border border-[#24344b] bg-[#0b1726]/80 p-6">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-teal-300">Last Chapter</p>
                      <h3 className="mt-2 text-2xl font-bold text-[var(--theme-text)]">{formatTitle(latestItem.name)}</h3>
                      <p className="mt-2 text-sm text-[var(--theme-text-secondary)]">
                        {latestItem.mimeType || "File"} · {formatBytes(latestItem.size)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onTabChange("books")}
                      className="inline-flex items-center gap-2 self-start rounded-xl border border-[#24344b] bg-[#122131] px-4 py-2 text-sm font-semibold text-[var(--theme-text)] transition-colors hover:border-teal-400/50 hover:text-teal-200"
                    >
                      Open Your Books
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No book activity yet"
                  message="Upload a file to your private bucket or open a file from the library to make this section live."
                />
              )}
            </div>
          </motion.section>

          <motion.aside
            className="space-y-6 xl:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="rounded-2xl border border-[#1F2A3D] bg-[rgba(16,28,44,0.78)] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-md">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--theme-text-secondary)]">Library summary</h2>
                <BookOpen className="h-5 w-5 text-teal-300" />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[#24344b] bg-[#0b1726]/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--theme-text-secondary)]">NCERT files</p>
                  <p className="mt-2 text-2xl font-bold text-[var(--theme-text)]">{libraryBooks.length}</p>
                </div>
                <div className="rounded-2xl border border-[#24344b] bg-[#0b1726]/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--theme-text-secondary)]">Private files</p>
                  <p className="mt-2 text-2xl font-bold text-[var(--theme-text)]">{userBooks.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#1F2A3D] bg-[rgba(16,28,44,0.78)] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-md">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--theme-text-secondary)]">Class</h2>
                <CalendarDays className="h-5 w-5 text-sky-300" />
              </div>
              <div className="mt-4 rounded-2xl border border-[#24344b] bg-[#0b1726]/70 p-4">
                <p className="text-3xl font-bold text-[var(--theme-text)]">{classLabel}</p>
                <p className="mt-2 text-sm text-[var(--theme-text-secondary)]">Pulled from your account metadata.</p>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </motion.div>
  );
}

function NotesSection() {
  return (
    <div className="px-8 py-8">
      <div className="mx-auto max-w-6xl">
        <EmptyState
          title="Notes"
          message="No Supabase notes source was provided yet, so this tab is ready for a table or storage binding when you want to add it."
        />
      </div>
    </div>
  );
}

function LibrarySection({ items }: { items: StorageItem[] }) {
  return (
    <motion.div className="px-8 py-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--theme-text)]">Library</h2>
          <p className="mt-2 text-sm text-[var(--theme-text-secondary)]">Public NCERT files from the Supabase bucket.</p>
        </div>

        {items.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <FileCard
                key={item.fullPath}
                title={formatTitle(item.name)}
                subtitle={item.mimeType || item.fullPath}
                size={formatBytes(item.size)}
                href={supabase.storage.from("ncert").getPublicUrl(item.fullPath).data.publicUrl}
                accent="bg-sky-500/10 text-sky-200"
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No NCERT files found" message="The public ncert bucket is empty or not readable yet." />
        )}
      </div>
    </motion.div>
  );
}

function BooksSection({ items }: { items: StorageItem[] }) {
  return (
    <motion.div className="px-8 py-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--theme-text)]">Your Books</h2>
          <p className="mt-2 text-sm text-[var(--theme-text-secondary)]">Your private bucket files from Supabase.</p>
        </div>

        {items.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <div key={item.fullPath} className="rounded-2xl border border-[#1F2A3D] bg-[rgba(16,28,44,0.78)] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--theme-text)]">{formatTitle(item.name)}</p>
                    <p className="mt-1 text-xs text-[var(--theme-text-secondary)]">{item.mimeType || item.fullPath}</p>
                  </div>
                  <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    Private
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4 text-xs text-[var(--theme-text-secondary)]">
                  <span>{formatBytes(item.size)}</span>
                  <a
                    href="#"
                    onClick={async (event) => {
                      event.preventDefault();
                      const { data } = await supabase.storage.from("user-books").createSignedUrl(item.fullPath, 60 * 60);
                      if (data?.signedUrl) {
                        window.open(data.signedUrl, "_blank", "noreferrer");
                      }
                    }}
                    className="inline-flex items-center gap-1 text-teal-300 transition-colors hover:text-teal-200"
                  >
                    Open <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No private books yet" message="Upload files into the user-books bucket to see them here." />
        )}
      </div>
    </motion.div>
  );
}

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

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userBooks, setUserBooks] = useState<StorageItem[]>([]);
  const [libraryBooks, setLibraryBooks] = useState<StorageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const user = userData.user;
        if (!isMounted) return;

        if (user) {
          const meta = user.user_metadata ?? {};
          setUserProfile({
            name: meta.full_name || meta.name || user.email?.split("@")[0] || "Student",
            email: user.email || "",
            classLabel: meta.grade ? `Class ${meta.grade}` : "Class",
            avatarUrl: meta.avatar_url || meta.picture || null,
          });
        }

        const [privateBooks, publicBooks] = await Promise.all([listStorageItems("user-books"), listStorageItems("ncert")]);

        if (!isMounted) return;

        setUserBooks(privateBooks);
        setLibraryBooks(publicBooks);
      } catch {
        if (isMounted) {
          setUserBooks([]);
          setLibraryBooks([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout?.();
  };

  if (loading || !userProfile) {
    return <SectionLoader label="dashboard" />;
  }

  return (
    <div className="min-h-screen bg-[#051424] text-[var(--theme-text)]">
      <aside className="fixed left-0 top-0 bottom-0 z-50 flex w-64 flex-col border-r border-[#1F2A3D] bg-[#051424] px-6 py-8">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#571bc1] to-teal-400 shadow-lg shadow-purple-500/10">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-purple-300 to-teal-300 bg-clip-text text-xl font-bold tracking-wide text-transparent">EduScrape</span>
        </div>

        <nav className="flex-1 space-y-2">
          {sidebarNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors duration-300 ${
                  isActive
                    ? "bg-[#571bc1] text-white shadow-lg shadow-[#571bc1]/35"
                    : "text-[var(--theme-text-secondary)] hover:bg-[#122131] hover:text-[var(--theme-text)]"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-6 border-t border-[#1F2A3D] pt-4">
          <div className="flex items-center justify-between px-2">
            <ThemeToggle />
            <button type="button" onClick={handleLogout} className="p-2 text-[var(--theme-text-secondary)] transition-colors hover:text-red-400" title="Logout">
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-transparent p-2 transition-all hover:border-[#1F2A3D] hover:bg-[#122131]">
            <div className="relative flex-shrink-0">
              {userProfile.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt={userProfile.name} className="h-10 w-10 rounded-full border-2 border-[#1F2A3D] object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-purple-400 to-teal-400 text-[#051424] shadow-inner">
                  <UserCircle2 className="h-6 w-6" />
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#051424] bg-green-500" />
            </div>
            <div className="overflow-hidden text-left">
              <p className="truncate text-sm font-semibold text-[var(--theme-text)]">{userProfile.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-[var(--theme-text-secondary)]">{userProfile.classLabel}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col pl-64">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-[#1F2A3D]/40 bg-[#051424]/80 px-8 backdrop-blur-xl">
          <h2 className="text-lg font-bold capitalize text-[var(--theme-text)]">{activeTab}</h2>
          <div className="text-sm text-[var(--theme-text-secondary)]">Everything is free</div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "overview" ? (
            <DashboardOverview profile={userProfile} userBooks={userBooks} libraryBooks={libraryBooks} onTabChange={setActiveTab} />
          ) : activeTab === "library" ? (
            <LibrarySection items={libraryBooks} />
          ) : activeTab === "notes" ? (
            <NotesSection />
          ) : activeTab === "books" ? (
            <BooksSection items={userBooks} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

