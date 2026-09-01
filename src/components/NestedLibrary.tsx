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
  SlidersHorizontal,
  FileCheck2,
  ArrowUpDown,
  BookCheck,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { supabase } from "../lib/supabaseClient";
import { findChaptersForBook } from "../lib/studyos";
import { isBoardClass } from "../lib/studyosCatalog";

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
  onOpenStudyHub?: (classNum?: string, cacheKey?: string, chapterCode?: string) => void;
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

const SAMPLE_NCERT_CATALOG: StorageItem[] = [
  { name: "Mathematics - Chapter 1 Real Numbers.pdf", fullPath: "Class 10/Mathematics/Mathematics - Chapter 1 Real Numbers.pdf", createdAt: null, updatedAt: null, size: 4200000, mimeType: "application/pdf" },
  { name: "Science - Chapter 1 Chemical Reactions.pdf", fullPath: "Class 10/Science/Science - Chapter 1 Chemical Reactions.pdf", createdAt: null, updatedAt: null, size: 5800000, mimeType: "application/pdf" },
  { name: "Social Science - India and Contemporary World.pdf", fullPath: "Class 10/Social Science/Social Science - India and Contemporary World.pdf", createdAt: null, updatedAt: null, size: 8400000, mimeType: "application/pdf" },
  { name: "English - First Flight.pdf", fullPath: "Class 10/English/English - First Flight.pdf", createdAt: null, updatedAt: null, size: 3600000, mimeType: "application/pdf" },
  { name: "Physics - Chapter 1 Electric Charges.pdf", fullPath: "Class 12/Physics/Physics - Chapter 1 Electric Charges.pdf", createdAt: null, updatedAt: null, size: 7100000, mimeType: "application/pdf" },
  { name: "Chemistry - Solid State.pdf", fullPath: "Class 12/Chemistry/Chemistry - Solid State.pdf", createdAt: null, updatedAt: null, size: 6500000, mimeType: "application/pdf" },
  { name: "Mathematics - Part 1.pdf", fullPath: "Class 12/Mathematics/Mathematics - Part 1.pdf", createdAt: null, updatedAt: null, size: 9200000, mimeType: "application/pdf" },
  { name: "Physics - Physical World.pdf", fullPath: "Class 11/Physics/Physics - Physical World.pdf", createdAt: null, updatedAt: null, size: 5400000, mimeType: "application/pdf" },
  { name: "Chemistry - Some Basic Concepts.pdf", fullPath: "Class 11/Chemistry/Chemistry - Some Basic Concepts.pdf", createdAt: null, updatedAt: null, size: 6100000, mimeType: "application/pdf" },
  { name: "Mathematics - Number Systems.pdf", fullPath: "Class 9/Mathematics/Mathematics - Number Systems.pdf", createdAt: null, updatedAt: null, size: 4800000, mimeType: "application/pdf" },
  { name: "Science - Matter in Our Surroundings.pdf", fullPath: "Class 9/Science/Science - Matter in Our Surroundings.pdf", createdAt: null, updatedAt: null, size: 5100000, mimeType: "application/pdf" },
  { name: "Mathematics - Rational Numbers.pdf", fullPath: "Class 8/Mathematics/Mathematics - Rational Numbers.pdf", createdAt: null, updatedAt: null, size: 3900000, mimeType: "application/pdf" },
  { name: "Science - Crop Production.pdf", fullPath: "Class 8/Science/Science - Crop Production.pdf", createdAt: null, updatedAt: null, size: 4100000, mimeType: "application/pdf" },
  { name: "Mathematics - Integers.pdf", fullPath: "Class 7/Mathematics/Mathematics - Integers.pdf", createdAt: null, updatedAt: null, size: 3200000, mimeType: "application/pdf" },
  { name: "Science - Nutrition in Plants.pdf", fullPath: "Class 7/Science/Science - Nutrition in Plants.pdf", createdAt: null, updatedAt: null, size: 3500000, mimeType: "application/pdf" },
  { name: "Mathematics - Knowing Our Numbers.pdf", fullPath: "Class 6/Mathematics/Mathematics - Knowing Our Numbers.pdf", createdAt: null, updatedAt: null, size: 2900000, mimeType: "application/pdf" },
  { name: "Science - Food Where Does It Come From.pdf", fullPath: "Class 6/Science/Science - Food Where Does It Come From.pdf", createdAt: null, updatedAt: null, size: 3100000, mimeType: "application/pdf" },
  { name: "Math-Magic - Book 5.pdf", fullPath: "Class 5/Mathematics/Math-Magic - Book 5.pdf", createdAt: null, updatedAt: null, size: 2400000, mimeType: "application/pdf" },
  { name: "Math-Magic - Book 4.pdf", fullPath: "Class 4/Mathematics/Math-Magic - Book 4.pdf", createdAt: null, updatedAt: null, size: 2100000, mimeType: "application/pdf" },
  { name: "Math-Magic - Book 3.pdf", fullPath: "Class 3/Mathematics/Math-Magic - Book 3.pdf", createdAt: null, updatedAt: null, size: 1900000, mimeType: "application/pdf" },
  { name: "Math-Magic - Book 2.pdf", fullPath: "Class 2/Mathematics/Math-Magic - Book 2.pdf", createdAt: null, updatedAt: null, size: 1800000, mimeType: "application/pdf" },
  { name: "Math-Magic - Book 1.pdf", fullPath: "Class 1/Mathematics/Math-Magic - Book 1.pdf", createdAt: null, updatedAt: null, size: 1700000, mimeType: "application/pdf" },
];

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
        className={`flex flex-col items-center justify-center rounded-md border border-border bg-secondary/50 skeleton-shimmer overflow-hidden ${
          aspect === "thumb" ? "h-14 w-11 flex-shrink-0" : "h-52 w-full"
        } ${className}`}
      >
        <div className="flex flex-col items-center gap-1.5 opacity-40 text-muted-foreground">
          <BookOpen className={aspect === "thumb" ? "h-4 w-4" : "h-7 w-7"} />
          {aspect !== "thumb" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        </div>
      </div>
    );
  }

  if (hasError || !thumbSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-secondary rounded-md border border-border text-muted-foreground ${
          aspect === "thumb" ? "h-14 w-11 flex-shrink-0" : "h-52 w-full"
        } ${className}`}
      >
        <BookOpen className={aspect === "thumb" ? "h-5 w-5" : "h-10 w-10 opacity-60"} />
        {aspect !== "thumb" && (
          <span className="mt-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            NCERT Book
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-md border border-border book-cover-depth ${
        aspect === "thumb" ? "h-14 w-11 flex-shrink-0" : "h-52 w-full"
      } ${className}`}
    >
      <img
        src={thumbSrc}
        alt={`Cover of ${title}`}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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

export const NestedLibrary: React.FC<NestedLibraryProps> = ({
  items,
  userClass,
  onOpenPdf,
  onOpenStudyHub,
}) => {
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
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"name" | "size">("name");

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

    const activeItems = items && items.length > 0 ? items : SAMPLE_NCERT_CATALOG;

    activeItems.forEach((item) => {
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

  // Extract available languages dynamically
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    allBooks.forEach((b) => langs.add(b.language));
    return ["All", ...Array.from(langs).sort()];
  }, [allBooks]);

  // Global search filtering + Language + Sorting
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    let list = allBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.subjectName.toLowerCase().includes(q) ||
        b.className.toLowerCase().includes(q) ||
        b.language.toLowerCase().includes(q)
    );

    if (selectedLanguage !== "All") {
      list = list.filter((b) => b.language === selectedLanguage);
    }

    if (sortBy === "name") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list.sort((a, b) => (b.size || 0) - (a.size || 0));
    }

    return list;
  }, [allBooks, searchQuery, selectedLanguage, sortBy]);

  // Current Subject books filtered & sorted
  const currentSubjectBooks = useMemo(() => {
    if (!selectedClass || !selectedSubject) return [];
    let list = classMap[selectedClass]?.subjects[selectedSubject]?.books || [];

    if (selectedLanguage !== "All") {
      list = list.filter((b) => b.language === selectedLanguage);
    }

    if (sortBy === "name") {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      return [...list].sort((a, b) => (b.size || 0) - (a.size || 0));
    }
  }, [classMap, selectedClass, selectedSubject, selectedLanguage, sortBy]);

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
    setSelectedLanguage("All");
  };

  const handleSelectSubject = (subjName: string | null) => {
    setSelectedSubject(subjName);
    setSelectedLanguage("All");
  };

  const handleResetBreadcrumbs = () => {
    setSelectedClass(null);
    setSelectedSubject(null);
    setSelectedLanguage("All");
    setSearchQuery("");
  };

  return (
    <motion.div
      className="p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md bg-secondary text-foreground shrink-0">
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-3xl font-bold text-foreground tracking-tight">
                NCERT Digital Library
              </h2>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground font-medium">
                  <BookCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-foreground" />
                  <span>{allBooks.length} Verified Textbooks</span>
                </span>
                {normalizedUserClass && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-mono uppercase bg-secondary text-muted-foreground border border-border">
                    <Sparkles className="h-2.5 w-2.5" />
                    <span>Your Class: {normalizedUserClass}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Toolbar: Search + View Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Universal Search Input */}
          <div className="relative flex-1 md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search catalog across classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="auth-input-field pl-9 pr-8 text-xs sm:text-sm font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-xs text-muted-foreground hover:text-foreground touch-manipulation"
              >
                ✕
              </button>
            )}
          </div>

          {/* Grid / List View Segmented Toggle */}
          <div className="flex items-center p-0.5 sm:p-1 rounded-md border border-border bg-card shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-sm transition-colors touch-manipulation active:scale-95 ${
                viewMode === "grid"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-sm transition-colors touch-manipulation active:scale-95 ${
                viewMode === "list"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Global Search Mode */}
      {searchQuery ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 sm:p-4 rounded-md border border-border bg-card">
            <p className="text-xs font-semibold text-muted-foreground">
              Search results for <span className="text-foreground font-bold">"{searchQuery}"</span> ({searchResults.length} textbooks)
            </p>
            <div className="flex items-center gap-3">
              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "name" | "size")}
                  className="bg-transparent border-none text-xs font-medium text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="name" className="bg-card text-foreground">Sort by Name</option>
                  <option value="size" className="bg-card text-foreground">Sort by Size</option>
                </select>
              </div>
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-2 touch-manipulation"
              >
                Clear
              </button>
            </div>
          </div>

          {searchResults.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
                {searchResults.map((book) => (
                  <motion.div
                    key={book.fullPath}
                    layout
                    className="group rounded-md border border-border bg-card p-3.5 sm:p-4 flex flex-col justify-between gap-3 transition-transform hover:-translate-y-px"
                  >
                    {/* First Page Dynamic Cover Preview */}
                    <PdfCoverThumbnail fullPath={book.fullPath} title={book.title} />

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1 text-[11px] font-mono">
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                          {book.className}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border truncate max-w-[100px]">
                          {book.subjectName}
                        </span>
                        <span className="text-muted-foreground">{formatBytes(book.size)}</span>
                      </div>

                      <h3 className="text-sm font-bold text-foreground line-clamp-2" title={book.title}>
                        {book.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Edition: <span className="text-foreground font-medium">{book.language}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenBook(book)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 sm:h-9 py-2 rounded-md font-medium text-xs sm:text-sm text-primary-foreground bg-primary hover:opacity-90 transition-opacity touch-manipulation active:scale-[0.97] shadow-xs cursor-pointer"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Read Book</span>
                      </button>
                      {onOpenStudyHub && (
                        <button
                          type="button"
                          onClick={() => {
                            const match = findChaptersForBook(book.title, book.className, book.subjectName);
                            onOpenStudyHub(
                              book.className.replace(/\D/g, ""),
                              match?.subject.cacheKey,
                              match?.activeChapter?.code
                            );
                          }}
                          className="inline-flex items-center justify-center gap-1 h-10 sm:h-9 px-3 rounded-md border border-border bg-secondary/80 hover:bg-secondary text-foreground text-xs font-medium transition-colors touch-manipulation active:scale-95 cursor-pointer shadow-xs"
                          title={isBoardClass(book.className) ? "View Board PYQs & Study Kit" : "View Chapter Study Kit & Cheatsheet"}
                        >
                          <GraduationCap className="h-3.5 w-3.5" />
                          <span>{isBoardClass(book.className) ? "PYQs" : "Study Kit"}</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Search List View */
              <div className="rounded-md border border-border bg-card divide-y divide-border overflow-hidden">
                {searchResults.map((book) => (
                  <div
                    key={book.fullPath}
                    className="p-3 sm:p-4 flex items-center justify-between gap-3 transition-colors hover:bg-secondary/40 group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <PdfCoverThumbnail fullPath={book.fullPath} title={book.title} aspect="thumb" />
                      <div className="truncate">
                        <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">{book.title}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] sm:text-xs text-muted-foreground font-mono">
                          <span className="font-medium text-foreground">{book.className}</span>
                          <span>•</span>
                          <span className="truncate">{book.subjectName}</span>
                          <span>•</span>
                          <span>{book.language}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onOpenStudyHub && (
                        <button
                          type="button"
                          onClick={() => {
                            const match = findChaptersForBook(book.title, book.className, book.subjectName);
                            onOpenStudyHub(
                              book.className.replace(/\D/g, ""),
                              match?.subject.cacheKey,
                              match?.activeChapter?.code
                            );
                          }}
                          className="inline-flex items-center justify-center gap-1 h-9 px-3 rounded-md border border-border bg-secondary/80 hover:bg-secondary text-foreground text-xs font-medium transition-colors touch-manipulation active:scale-95 cursor-pointer"
                          title={isBoardClass(book.className) ? "View Board PYQs & Study Kit" : "View Chapter Study Kit & Cheatsheet"}
                        >
                          <GraduationCap className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{isBoardClass(book.className) ? "PYQs" : "Study Kit"}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenBook(book)}
                        className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-md font-medium text-xs text-primary-foreground bg-primary hover:opacity-90 transition-opacity touch-manipulation active:scale-95 shadow-xs cursor-pointer"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Read</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="rounded-md border border-dashed border-border p-8 sm:p-12 text-center">
              <Search className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground opacity-40" />
              <p className="mt-3 text-sm sm:text-base font-semibold text-foreground">
                No matching textbooks found
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try searching by subject name (e.g. "Science", "Math", "Physics") or book title.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Hierarchical Nested Navigation */
        <div className="space-y-4 sm:space-y-6">
          {/* Interactive Breadcrumb Bar */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-md border border-border bg-card text-xs font-medium">
            <button
              onClick={handleResetBreadcrumbs}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors touch-manipulation ${
                !selectedClass
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>All Classes</span>
            </button>

            {selectedClass && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                <button
                  onClick={() => setSelectedSubject(null)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors touch-manipulation ${
                    selectedClass && !selectedSubject
                      ? "bg-foreground text-background font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  <span>{selectedClass}</span>
                </button>
              </>
            )}

            {selectedSubject && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-foreground text-background font-semibold">
                  <BookMarked className="h-3.5 w-3.5" />
                  <span>{selectedSubject}</span>
                </div>
              </>
            )}
          </div>

          {/* Class Quick Switcher Pills (Horizontal Scroll Snap on Mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 mobile-scroll-row">
            <button
              onClick={() => handleSelectClass(null)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium whitespace-nowrap transition-colors touch-manipulation active:scale-[0.97] ${
                !selectedClass
                  ? "bg-foreground text-background"
                  : "border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              All Classes
            </button>
            {sortedClasses.map((cls) => {
              const isAccountClass = normalizedUserClass === cls.name;
              return (
                <button
                  key={cls.name}
                  onClick={() => handleSelectClass(cls.name)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 touch-manipulation active:scale-[0.97] ${
                    selectedClass === cls.name
                      ? "bg-foreground text-background font-semibold"
                      : isAccountClass
                      ? "border border-foreground/30 text-foreground hover:bg-secondary"
                      : "border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {isAccountClass && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                  <span>{cls.name}</span>
                  <span className="opacity-70 font-mono">({cls.totalBooks})</span>
                </button>
              );
            })}
          </div>

          {/* VIEW LEVEL 1: CLASS SELECTION GRID */}
          {!selectedClass && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Select Grade Level
                </h3>
                <span className="text-[11px] sm:text-xs font-mono text-muted-foreground">
                  {sortedClasses.length} Classes
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {sortedClasses.map((cls) => {
                  const subjectKeys = Object.keys(cls.subjects);
                  const isAccountClass = normalizedUserClass === cls.name;
                  return (
                    <motion.div
                      key={cls.name}
                      whileHover={{ y: -2 }}
                      onClick={() => handleSelectClass(cls.name)}
                      className={`group cursor-pointer rounded-md border p-4 sm:p-5 flex flex-col justify-between gap-3 sm:gap-4 transition-all bg-card touch-manipulation active:scale-[0.98] ${
                        isAccountClass ? "border-foreground/30 ring-1 ring-border" : "border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-secondary text-foreground font-bold text-xs sm:text-sm font-mono">
                          {cls.classNumber || cls.name.replace(/Class\s*/i, "")}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isAccountClass && (
                            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono uppercase tracking-wider bg-secondary text-foreground border border-border">
                              Your Class
                            </span>
                          )}
                          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono bg-secondary text-muted-foreground border border-border">
                            {cls.totalBooks} Books
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-foreground">{cls.name}</h4>
                        <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {subjectKeys.length} Subjects: {subjectKeys.join(", ")}
                        </p>
                      </div>

                      <div className="pt-2.5 sm:pt-3 border-t border-border flex items-center justify-between text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        <span>Open Curriculum</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW LEVEL 2: SUBJECT SELECTION GRID WITHIN SELECTED CLASS */}
          {selectedClass && !selectedSubject && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedClass(null)}
                  className="inline-flex items-center gap-1.5 h-9 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to classes</span>
                </button>
                <span className="text-[11px] sm:text-xs font-mono text-muted-foreground">
                  {classMap[selectedClass]?.totalBooks || 0} Books in {selectedClass}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {Object.values(classMap[selectedClass]?.subjects || {}).map((subj) => {
                  const firstBook = subj.books[0];
                  return (
                    <motion.div
                      key={subj.name}
                      whileHover={{ y: -2 }}
                      onClick={() => handleSelectSubject(subj.name)}
                      className="group cursor-pointer rounded-md border border-border bg-card p-4 sm:p-5 flex flex-col justify-between gap-3 sm:gap-4 transition-all touch-manipulation active:scale-[0.98]"
                    >
                      {/* Dynamic Subject Cover Thumbnail */}
                      {firstBook ? (
                        <PdfCoverThumbnail fullPath={firstBook.fullPath} title={firstBook.title} />
                      ) : (
                        <div className="h-44 sm:h-52 w-full flex flex-col items-center justify-center rounded-md bg-secondary text-muted-foreground">
                          <Folder className="h-8 w-8 sm:h-10 sm:w-10 opacity-70" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-mono bg-secondary text-muted-foreground border border-border">
                            {subj.books.length} Textbooks
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-foreground transition-colors">
                          {subj.name}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-muted-foreground">
                          NCERT syllabus editions
                        </p>
                      </div>

                      <div className="pt-2.5 sm:pt-3 border-t border-border flex items-center justify-between text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        <span>Browse Books</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW LEVEL 3: BOOK SELECTION WITHIN SELECTED SUBJECT */}
          {selectedClass && selectedSubject && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 sm:p-4 rounded-md border border-border bg-card">
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="inline-flex items-center gap-1.5 h-9 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to {selectedClass} subjects</span>
                </button>

                {/* Filter & Sort Controls */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  {/* Language Filter */}
                  {availableLanguages.length > 2 && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="bg-transparent border-none text-xs font-medium text-foreground focus:outline-none cursor-pointer"
                      >
                        {availableLanguages.map((lang) => (
                          <option key={lang} value={lang} className="bg-card text-foreground">
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Sort Selector */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "name" | "size")}
                      className="bg-transparent border-none text-xs font-medium text-foreground focus:outline-none cursor-pointer"
                    >
                      <option value="name" className="bg-card text-foreground">Name (A-Z)</option>
                      <option value="size" className="bg-card text-foreground">File Size</option>
                    </select>
                  </div>

                  <span className="text-[11px] sm:text-xs font-mono text-muted-foreground pl-2 border-l border-border">
                    {currentSubjectBooks.length} Books
                  </span>
                </div>
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
                  {currentSubjectBooks.map((book) => (
                    <div
                      key={book.fullPath}
                      className="group rounded-md border border-border bg-card p-3.5 sm:p-4 flex flex-col justify-between gap-3 transition-transform hover:-translate-y-px"
                    >
                      {/* First Page Dynamic Cover */}
                      <PdfCoverThumbnail fullPath={book.fullPath} title={book.title} />

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                            {book.language} Edition
                          </span>
                          <span className="text-muted-foreground text-[11px]">
                            {formatBytes(book.size)}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-snug" title={book.title}>
                          {book.title}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1">
                          <FileCheck2 className="h-3 w-3 text-foreground" />
                          <span>Official NCERT Edition</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleOpenBook(book)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 sm:h-9 py-2 rounded-md font-medium text-xs sm:text-sm text-primary-foreground bg-primary hover:opacity-90 transition-opacity touch-manipulation active:scale-[0.97] shadow-xs cursor-pointer"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>Read Book</span>
                        </button>
                        {onOpenStudyHub && (
                          <button
                            type="button"
                            onClick={() => {
                              const match = findChaptersForBook(book.title, book.className, book.subjectName);
                              onOpenStudyHub(
                                book.className.replace(/\D/g, ""),
                                match?.subject.cacheKey,
                                match?.activeChapter?.code
                              );
                            }}
                            className="inline-flex items-center justify-center gap-1 h-10 sm:h-9 px-3 rounded-md border border-border bg-secondary/80 hover:bg-secondary text-foreground text-xs font-medium transition-colors touch-manipulation active:scale-95 cursor-pointer shadow-xs"
                            title={isBoardClass(book.className) ? "View Board PYQs & Study Kit" : "View Chapter Study Kit & Cheatsheet"}
                          >
                            <GraduationCap className="h-3.5 w-3.5" />
                            <span>{isBoardClass(book.className) ? "PYQs" : "Study Kit"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="rounded-md border border-border bg-card divide-y divide-border overflow-hidden">
                  {currentSubjectBooks.map((book) => (
                    <div
                      key={book.fullPath}
                      className="p-3 sm:p-4 flex items-center justify-between gap-3 transition-colors hover:bg-secondary/40 group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <PdfCoverThumbnail fullPath={book.fullPath} title={book.title} aspect="thumb" />
                        <div className="truncate">
                          <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">{book.title}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] sm:text-xs text-muted-foreground font-mono">
                            <span className="font-medium text-foreground">{book.language} Edition</span>
                            <span>•</span>
                            <span>{formatBytes(book.size)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {onOpenStudyHub && (
                          <button
                            type="button"
                            onClick={() => {
                              const match = findChaptersForBook(book.title, book.className, book.subjectName);
                              onOpenStudyHub(
                                book.className.replace(/\D/g, ""),
                                match?.subject.cacheKey,
                                match?.activeChapter?.code
                              );
                            }}
                            className="inline-flex items-center justify-center gap-1 h-9 px-3 rounded-md border border-border bg-secondary/80 hover:bg-secondary text-foreground text-xs font-medium transition-colors touch-manipulation active:scale-95 cursor-pointer"
                            title={isBoardClass(book.className) ? "View Board PYQs & Study Kit" : "View Chapter Study Kit & Cheatsheet"}
                          >
                            <GraduationCap className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{isBoardClass(book.className) ? "PYQs" : "Study Kit"}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenBook(book)}
                          className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-md font-medium text-xs text-primary-foreground bg-primary hover:opacity-90 transition-opacity touch-manipulation active:scale-95 shadow-xs cursor-pointer"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>Read</span>
                        </button>
                      </div>
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
