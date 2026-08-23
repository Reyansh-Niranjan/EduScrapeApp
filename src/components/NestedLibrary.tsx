import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Folder,
  FolderOpen,
  ChevronRight,
  Search,
  GraduationCap,
  ArrowLeft,
  Layers,
  LayoutGrid,
  List,
  Loader2,
  BookMarked,
  Sparkles,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { supabase } from "../lib/supabaseClient";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface StorageItem {
  name: string;
  fullPath: string;
  createdAt: string | null;
  updatedAt: string | null;
  size: number | null;
  mimeType: string | null;
}

interface NestedLibraryProps {
  items: StorageItem[];
  userClass?: string;
  onOpenPdf: (url: string, title: string, className?: string, subject?: string) => void;
}

interface ParsedBook {
  name: string;
  title: string;
  fullPath: string;
  className: string;
  subjectName: string;
  size: number | null;
  publicUrl: string;
  language: string;
}

interface ParsedSubject {
  name: string;
  className: string;
  books: ParsedBook[];
}

interface ParsedClass {
  name: string;
  classNumber: number;
  subjects: Record<string, ParsedSubject>;
  totalBooks: number;
}

// Global in-memory cache for rendered first-page thumbnails
const thumbnailCache = new Map<string, string>();

/**
 * Dynamic First-Page PDF Cover Thumbnail
 * Renders page 1 of any NCERT PDF dynamically via PDF.js with signed Supabase URLs
 */
const PdfCoverThumbnail: React.FC<{
  fullPath: string;
  title: string;
  bucket?: string;
  className?: string;
  aspect?: "portrait" | "thumb";
}> = ({ fullPath, title, bucket = "ncert", className = "", aspect = "portrait" }) => {
  const [thumbSrc, setThumbSrc] = useState<string | null>(thumbnailCache.get(fullPath) || null);
  const [loading, setLoading] = useState<boolean>(!thumbnailCache.has(fullPath));
  const [hasError, setHasError] = useState<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    if (thumbnailCache.has(fullPath)) {
      setThumbSrc(thumbnailCache.get(fullPath)!);
      setLoading(false);
      return;
    }

    let loadingTask: any = null;

    const renderCover = async () => {
      try {
        setLoading(true);
        // Create signed URL to support both Private and Public Supabase buckets
        const { data: signedData } = await supabase.storage
          .from(bucket)
          .createSignedUrl(fullPath, 60 * 60);

        const targetUrl = signedData?.signedUrl || supabase.storage.from(bucket).getPublicUrl(fullPath).data.publicUrl;

        loadingTask = pdfjsLib.getDocument({
          url: targetUrl,
          cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@legacy/cmaps/",
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 0.45 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderContext).promise;

        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        thumbnailCache.set(fullPath, dataUrl);

        if (isMountedRef.current) {
          setThumbSrc(dataUrl);
          setLoading(false);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setHasError(true);
          setLoading(false);
        }
      }
    };

    renderCover();

    return () => {
      isMountedRef.current = false;
      if (loadingTask && loadingTask.destroy) {
        loadingTask.destroy();
      }
    };
  }, [fullPath, bucket]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-900/40 rounded-2xl border border-white/10 ${
          aspect === "thumb" ? "h-14 w-11" : "h-48 w-full"
        } ${className}`}
      >
        <Loader2 className="h-5 w-5 animate-spin text-purple-400 opacity-60" />
      </div>
    );
  }

  if (hasError || !thumbSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-tr from-purple-900/30 to-slate-900/60 rounded-2xl border border-purple-500/20 text-purple-300 ${
          aspect === "thumb" ? "h-14 w-11" : "h-48 w-full"
        } ${className}`}
      >
        <BookOpen className={aspect === "thumb" ? "h-5 w-5" : "h-10 w-10 opacity-75"} />
        {aspect !== "thumb" && <span className="mt-2 text-[10px] font-semibold opacity-60">NCERT Book</span>}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 shadow-md transition-all group-hover:shadow-xl ${
        aspect === "thumb" ? "h-14 w-11 flex-shrink-0" : "h-48 w-full"
      } ${className}`}
    >
      <img
        src={thumbSrc}
        alt={`Cover of ${title}`}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
};

function formatTitle(name: string): string {
  return name
    .replace(/\.pdf$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatBytes(bytes: number | null): string {
  if (!bytes || bytes <= 0) return "--";
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${mb.toFixed(1)} MB`;
}

function extractLanguage(title: string): string {
  const match = title.match(/\(([^)]+)\)$/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return "Standard";
}

export const NestedLibrary: React.FC<NestedLibraryProps> = ({ items, userClass, onOpenPdf }) => {
  // Normalize user class (e.g. "Class 10")
  const normalizedUserClass = useMemo(() => {
    if (!userClass) return null;
    const match = userClass.match(/\d+/);
    return match ? `Class ${match[0]}` : userClass;
  }, [userClass]);

  const [selectedClass, setSelectedClass] = useState<string | null>(normalizedUserClass || null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Sync with account class whenever profile updates
  useEffect(() => {
    if (normalizedUserClass && !selectedClass) {
      setSelectedClass(normalizedUserClass);
    }
  }, [normalizedUserClass]);

  // Parse flat storage items into dynamic nested hierarchy
  const { classMap, allBooks, sortedClasses } = useMemo(() => {
    const classMap: Record<string, ParsedClass> = {};
    const allBooks: ParsedBook[] = [];

    items.forEach((item) => {
      if (!item.name.toLowerCase().endsWith(".pdf")) return;

      const parts = item.fullPath.split("/");
      let className = "Class 10";
      let subjectName = "General";
      let rawTitle = item.name;

      if (parts.length >= 3) {
        className = parts[0];
        subjectName = parts[1];
        rawTitle = parts[parts.length - 1];
      } else if (parts.length === 2) {
        className = parts[0];
        rawTitle = parts[1];
      }

      const classNumMatch = className.match(/\d+/);
      const classNumber = classNumMatch ? parseInt(classNumMatch[0], 10) : 0;
      const formatted = formatTitle(rawTitle);
      const publicUrl = supabase.storage.from("ncert").getPublicUrl(item.fullPath).data.publicUrl;
      const lang = extractLanguage(formatted);

      const parsedBook: ParsedBook = {
        name: item.name,
        title: formatted,
        fullPath: item.fullPath,
        className,
        subjectName,
        size: item.size,
        publicUrl,
        language: lang,
      };

      allBooks.push(parsedBook);

      if (!classMap[className]) {
        classMap[className] = {
          name: className,
          classNumber,
          subjects: {},
          totalBooks: 0,
        };
      }

      classMap[className].totalBooks += 1;

      if (!classMap[className].subjects[subjectName]) {
        classMap[className].subjects[subjectName] = {
          name: subjectName,
          className,
          books: [],
        };
      }

      classMap[className].subjects[subjectName].books.push(parsedBook);
    });

    const sortedClasses = Object.values(classMap).sort((a, b) => a.classNumber - b.classNumber);

    return { classMap, allBooks, sortedClasses };
  }, [items]);

  // Global search filtering
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return allBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.subjectName.toLowerCase().includes(q) ||
        b.className.toLowerCase().includes(q) ||
        b.language.toLowerCase().includes(q)
    );
  }, [allBooks, searchQuery]);

  // Open book with signed URL to support both public and private Supabase buckets
  const handleOpenBook = async (book: ParsedBook) => {
    try {
      const { data } = await supabase.storage.from("ncert").createSignedUrl(book.fullPath, 60 * 60);
      if (data?.signedUrl) {
        onOpenPdf(data.signedUrl, book.title, book.className, book.subjectName);
        return;
      }
    } catch (e) {
      console.warn("Signed URL creation failed:", e);
    }
    const pubUrl = supabase.storage.from("ncert").getPublicUrl(book.fullPath).data.publicUrl;
    onOpenPdf(pubUrl, book.title, book.className, book.subjectName);
  };

  // Navigation handlers
  const handleSelectClass = (clsName: string | null) => {
    setSelectedClass(clsName);
    setSelectedSubject(null);
  };

  const handleSelectSubject = (subjName: string | null) => {
    setSelectedSubject(subjName);
  };

  const handleResetBreadcrumbs = () => {
    setSelectedClass(null);
    setSelectedSubject(null);
    setSearchQuery("");
  };

  return (
    <motion.div
      className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-text)] tracking-tight">
                NCERT Digital Library
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-[var(--theme-text-secondary)]">
                  {allBooks.length} Live Textbooks
                </span>
                {normalizedUserClass && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20">
                    <Sparkles className="h-2.5 w-2.5" />
                    <span>Your Class: {normalizedUserClass}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Toolbar: Catalog Search + Grid/List View Switcher */}
        <div className="flex items-center gap-3">
          {/* Universal Search Input */}
          <div className="relative flex-1 md:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--theme-text-secondary)]" />
            <input
              type="text"
              placeholder="Search catalog across all classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="auth-input-field pl-10 pr-9 text-xs sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Grid / List View Toggle */}
          <div
            className="flex items-center p-1 rounded-2xl border bg-[var(--theme-card-bg)]"
            style={{ borderColor: "var(--theme-border)" }}
          >
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-xl transition ${
                viewMode === "grid"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)]"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-xl transition ${
                viewMode === "list"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)]"
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Global Search Mode */}
      {searchQuery ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[var(--theme-text-secondary)]">
              Search results for <span className="text-[var(--theme-text)] font-bold">"{searchQuery}"</span> ({searchResults.length} matching textbooks)
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-semibold text-purple-400 hover:underline"
            >
              Clear Search
            </button>
          </div>

          {searchResults.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {searchResults.map((book) => (
                  <motion.div
                    key={book.fullPath}
                    layout
                    className="group rounded-3xl border p-4 shadow-sm flex flex-col justify-between gap-3.5 transition-all hover:shadow-xl hover:-translate-y-1"
                    style={{
                      background: "var(--theme-card-bg)",
                      borderColor: "var(--theme-border)",
                    }}
                  >
                    {/* First Page Dynamic Cover Preview */}
                    <PdfCoverThumbnail fullPath={book.fullPath} title={book.title} />

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {book.className}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          {book.subjectName}
                        </span>
                        <span className="font-mono text-[var(--theme-text-secondary)]">{formatBytes(book.size)}</span>
                      </div>

                      <h3 className="text-sm font-bold text-[var(--theme-text)] line-clamp-2" title={book.title}>
                        {book.title}
                      </h3>
                      <p className="text-[11px] text-[var(--theme-text-secondary)]">
                        Edition: <span className="text-[var(--theme-text)] font-medium">{book.language}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenBook(book)}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-700 transition shadow-md shadow-purple-500/20 hover:scale-[1.02]"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Read Textbook</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Search List View */
              <div
                className="rounded-3xl border overflow-hidden divide-y divide-[var(--theme-border)]"
                style={{
                  background: "var(--theme-card-bg)",
                  borderColor: "var(--theme-border)",
                }}
              >
                {searchResults.map((book) => (
                  <div
                    key={book.fullPath}
                    className="p-4 flex items-center justify-between gap-4 transition hover:bg-purple-500/5 group"
                  >
                    <div className="flex items-center gap-3.5 overflow-hidden">
                      <PdfCoverThumbnail fullPath={book.fullPath} title={book.title} aspect="thumb" />
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-[var(--theme-text)] truncate">{book.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--theme-text-secondary)]">
                          <span className="font-semibold text-purple-400">{book.className}</span>
                          <span>•</span>
                          <span>{book.subjectName}</span>
                          <span>•</span>
                          <span>{book.language}</span>
                          <span>•</span>
                          <span className="font-mono">{formatBytes(book.size)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenBook(book)}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-700 transition shadow-sm hover:scale-105"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Read</span>
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div
              className="rounded-3xl border border-dashed p-12 text-center"
              style={{ borderColor: "var(--theme-border)" }}
            >
              <Search className="mx-auto h-10 w-10 text-[var(--theme-text-secondary)] opacity-40" />
              <p className="mt-4 text-base font-semibold text-[var(--theme-text)]">
                No matching textbooks found
              </p>
              <p className="mt-1 text-xs text-[var(--theme-text-secondary)]">
                Try searching by subject name (e.g. "Science", "Math", "Physics") or book title.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Hierarchical Nested Navigation */
        <div className="space-y-6">
          {/* Interactive Breadcrumb Bar */}
          <div
            className="flex items-center flex-wrap gap-2 p-3 rounded-2xl border bg-[var(--theme-card-bg)] text-xs font-semibold"
            style={{ borderColor: "var(--theme-border)" }}
          >
            <button
              onClick={handleResetBreadcrumbs}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                !selectedClass
                  ? "bg-purple-600 text-white font-bold shadow-sm"
                  : "text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-bg)]"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>All Classes</span>
            </button>

            {selectedClass && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-[var(--theme-text-secondary)]" />
                <button
                  onClick={() => setSelectedSubject(null)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                    selectedClass && !selectedSubject
                      ? "bg-purple-600 text-white font-bold shadow-sm"
                      : "text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-bg)]"
                  }`}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  <span>{selectedClass}</span>
                </button>
              </>
            )}

            {selectedSubject && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-[var(--theme-text-secondary)]" />
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold shadow-sm">
                  <BookMarked className="h-3.5 w-3.5" />
                  <span>{selectedSubject}</span>
                </div>
              </>
            )}
          </div>

          {/* Class Quick Switcher Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => handleSelectClass(null)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                !selectedClass
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                  : "border text-[var(--theme-text-secondary)] hover:bg-[var(--theme-card-bg)] hover:text-[var(--theme-text)]"
              }`}
              style={{ borderColor: "var(--theme-border)" }}
            >
              Overview (All)
            </button>
            {sortedClasses.map((cls) => {
              const isAccountClass = normalizedUserClass === cls.name;
              return (
                <button
                  key={cls.name}
                  onClick={() => handleSelectClass(cls.name)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedClass === cls.name
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                      : isAccountClass
                      ? "border border-purple-500/40 text-purple-400 hover:bg-purple-500/10"
                      : "border text-[var(--theme-text-secondary)] hover:bg-[var(--theme-card-bg)] hover:text-[var(--theme-text)]"
                  }`}
                  style={{ borderColor: selectedClass === cls.name ? undefined : "var(--theme-border)" }}
                >
                  {isAccountClass && <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />}
                  <span>{cls.name}</span>
                  <span className="opacity-70">({cls.totalBooks})</span>
                </button>
              );
            })}
          </div>

          {/* VIEW LEVEL 1: CLASS SELECTION GRID */}
          {!selectedClass && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">
                  Select Grade Level
                </h3>
                <span className="text-xs text-[var(--theme-text-secondary)]">
                  {sortedClasses.length} Classes Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedClasses.map((cls) => {
                  const subjectKeys = Object.keys(cls.subjects);
                  const isAccountClass = normalizedUserClass === cls.name;
                  return (
                    <motion.div
                      key={cls.name}
                      whileHover={{ y: -3, scale: 1.01 }}
                      onClick={() => handleSelectClass(cls.name)}
                      className={`cursor-pointer rounded-3xl border p-5 shadow-sm flex flex-col justify-between gap-4 transition-all ${
                        isAccountClass ? "ring-2 ring-purple-500/30" : ""
                      }`}
                      style={{
                        background: "var(--theme-card-bg)",
                        borderColor: "var(--theme-border)",
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 font-extrabold text-base">
                          {cls.classNumber || cls.name.replace(/Class\s*/i, "")}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isAccountClass && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300">
                              Your Class
                            </span>
                          )}
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/10 text-[var(--theme-text-secondary)]">
                            {cls.totalBooks} Books
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-[var(--theme-text)]">{cls.name}</h4>
                        <p className="text-xs text-[var(--theme-text-secondary)] mt-1 line-clamp-2">
                          {subjectKeys.length} Subjects: {subjectKeys.join(", ")}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[var(--theme-border)] flex items-center justify-between text-xs font-semibold text-purple-400">
                        <span>Open Curriculum</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW LEVEL 2: SUBJECT SELECTION GRID WITHIN SELECTED CLASS */}
          {selectedClass && !selectedSubject && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedClass(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to all classes</span>
                </button>
                <span className="text-xs font-bold text-[var(--theme-text)]">
                  {classMap[selectedClass]?.totalBooks || 0} Textbooks in {selectedClass}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Object.values(classMap[selectedClass]?.subjects || {}).map((subj) => {
                  // Use the first book's cover as the preview cover for this subject folder
                  const firstBook = subj.books[0];
                  return (
                    <motion.div
                      key={subj.name}
                      whileHover={{ y: -3 }}
                      onClick={() => handleSelectSubject(subj.name)}
                      className="group cursor-pointer rounded-3xl border p-5 shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-xl"
                      style={{
                        background: "var(--theme-card-bg)",
                        borderColor: "var(--theme-border)",
                      }}
                    >
                      {/* Dynamic Subject Cover Thumbnail */}
                      {firstBook ? (
                        <PdfCoverThumbnail fullPath={firstBook.fullPath} title={firstBook.title} />
                      ) : (
                        <div className="h-48 w-full flex flex-col items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
                          <Folder className="h-10 w-10 opacity-70" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {subj.books.length} Textbooks
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-[var(--theme-text)] group-hover:text-purple-400 transition">
                          {subj.name}
                        </h4>
                        <p className="text-xs text-[var(--theme-text-secondary)]">
                          NCERT syllabus textbook editions
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[var(--theme-border)] flex items-center justify-between text-xs font-semibold text-purple-400">
                        <span>Browse Books</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW LEVEL 3: BOOK SELECTION (GRID / LIST) WITHIN SELECTED SUBJECT */}
          {selectedClass && selectedSubject && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to {selectedClass} subjects</span>
                </button>
                <span className="text-xs font-bold text-[var(--theme-text)]">
                  {classMap[selectedClass]?.subjects[selectedSubject]?.books.length || 0} Textbooks
                </span>
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {(classMap[selectedClass]?.subjects[selectedSubject]?.books || []).map((book) => (
                    <div
                      key={book.fullPath}
                      className="group rounded-3xl border p-4 shadow-sm flex flex-col justify-between gap-3.5 transition-all hover:shadow-xl hover:-translate-y-1"
                      style={{
                        background: "var(--theme-card-bg)",
                        borderColor: "var(--theme-border)",
                      }}
                    >
                      {/* First Page Dynamic Cover */}
                      <PdfCoverThumbnail fullPath={book.fullPath} title={book.title} />

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {book.language}
                          </span>
                          <span className="font-mono text-[var(--theme-text-secondary)]">
                            {formatBytes(book.size)}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-[var(--theme-text)] line-clamp-2" title={book.title}>
                          {book.title}
                        </h3>
                        <p className="text-[11px] text-[var(--theme-text-secondary)]">
                          NCERT Official Cleaned Edition
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenBook(book)}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-700 transition shadow-md shadow-purple-500/20 hover:scale-[1.02]"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Read Textbook</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div
                  className="rounded-3xl border overflow-hidden divide-y divide-[var(--theme-border)]"
                  style={{
                    background: "var(--theme-card-bg)",
                    borderColor: "var(--theme-border)",
                  }}
                >
                  {(classMap[selectedClass]?.subjects[selectedSubject]?.books || []).map((book) => (
                    <div
                      key={book.fullPath}
                      className="p-4 flex items-center justify-between gap-4 transition hover:bg-purple-500/5 group"
                    >
                      <div className="flex items-center gap-3.5 overflow-hidden">
                        <PdfCoverThumbnail fullPath={book.fullPath} title={book.title} aspect="thumb" />
                        <div className="truncate">
                          <h4 className="text-sm font-bold text-[var(--theme-text)] truncate">{book.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--theme-text-secondary)]">
                            <span className="font-semibold text-purple-400">{book.language} Edition</span>
                            <span>•</span>
                            <span className="font-mono">{formatBytes(book.size)}</span>
                            <span>•</span>
                            <span>NCERT Cleaned</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenBook(book)}
                        className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-700 transition shadow-sm hover:scale-105"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Read</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
