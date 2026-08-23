import React, { useState, useMemo } from "react";
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
  BookMarked,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

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
  return "Standard Edition";
}

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Mathematics: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  Science: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  "Social Science": { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  English: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  Hindi: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
  Sanskrit: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  Urdu: { bg: "bg-teal-500/10", text: "text-teal-400", border: "border-teal-500/20" },
  Arts: { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/20" },
  "Vocational Education": { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
  Health: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
};

function getSubjectTheme(subjName: string) {
  for (const [key, theme] of Object.entries(SUBJECT_COLORS)) {
    if (subjName.toLowerCase().includes(key.toLowerCase())) {
      return theme;
    }
  }
  return { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/20" };
}

export const NestedLibrary: React.FC<NestedLibraryProps> = ({ items, onOpenPdf }) => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Parse flat storage items into nested hierarchy
  const { classMap, allBooks, sortedClasses } = useMemo(() => {
    const classMap: Record<string, ParsedClass> = {};
    const allBooks: ParsedBook[] = [];

    items.forEach((item) => {
      // Ignore root metadata files like catalog.json
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
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-text)] tracking-tight">
              NCERT Digital Library
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--theme-text-secondary)] mt-1">
            Hierarchical syllabus catalog with {allBooks.length} verified textbooks across all 12 classes
          </p>
        </div>

        {/* Catalog Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--theme-text-secondary)]" />
          <input
            type="text"
            placeholder="Search all books, subjects, or classes..."
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
              className="text-xs font-semibold text-sky-400 hover:underline"
            >
              Clear Search
            </button>
          </div>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((book) => {
                const theme = getSubjectTheme(book.subjectName);
                return (
                  <motion.div
                    key={book.fullPath}
                    layout
                    className="rounded-3xl border p-5 shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-md hover:-translate-y-1"
                    style={{
                      background: "var(--theme-card-bg)",
                      borderColor: "var(--theme-border)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {book.className}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${theme.bg} ${theme.text} border ${theme.border}`}>
                          {book.subjectName}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--theme-text-secondary)]">
                        {formatBytes(book.size)}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[var(--theme-text)] line-clamp-2">
                        {book.title}
                      </h3>
                      {book.language && (
                        <p className="text-xs text-[var(--theme-text-secondary)] mt-1 flex items-center gap-1">
                          <span>Language:</span>
                          <span className="font-medium text-[var(--theme-text)]">{book.language}</span>
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[var(--theme-border)] flex items-center justify-between">
                      <span className="text-[11px] text-[var(--theme-text-secondary)]">NCERT Edition</span>
                      <button
                        type="button"
                        onClick={() => onOpenPdf(book.publicUrl, book.title, book.className, book.subjectName)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 transition shadow-md shadow-sky-500/20 hover:scale-105"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Read Book</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
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
                Try searching by subject name (e.g. "Physics", "Science", "Math") or book title.
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
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition ${
                !selectedClass
                  ? "bg-sky-500/15 text-sky-400 font-bold"
                  : "text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)]"
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
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition ${
                    selectedClass && !selectedSubject
                      ? "bg-purple-500/15 text-purple-400 font-bold"
                      : "text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)]"
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
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 font-bold">
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
                  ? "bg-sky-600 text-white shadow-md shadow-sky-500/25"
                  : "border text-[var(--theme-text-secondary)] hover:bg-[var(--theme-card-bg)] hover:text-[var(--theme-text)]"
              }`}
              style={{ borderColor: "var(--theme-border)" }}
            >
              Overview (All)
            </button>
            {sortedClasses.map((cls) => (
              <button
                key={cls.name}
                onClick={() => handleSelectClass(cls.name)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedClass === cls.name
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                    : "border text-[var(--theme-text-secondary)] hover:bg-[var(--theme-card-bg)] hover:text-[var(--theme-text)]"
                }`}
                style={{ borderColor: "var(--theme-border)" }}
              >
                {cls.name} ({cls.totalBooks})
              </button>
            ))}
          </div>

          {/* VIEW LEVEL 1: CLASS SELECTION GRID */}
          {!selectedClass && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">
                  Select Grade / Class Level
                </h3>
                <span className="text-xs text-[var(--theme-text-secondary)]">
                  {sortedClasses.length} Grade Categories
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedClasses.map((cls) => {
                  const subjectKeys = Object.keys(cls.subjects);
                  return (
                    <motion.div
                      key={cls.name}
                      whileHover={{ y: -3, scale: 1.01 }}
                      onClick={() => handleSelectClass(cls.name)}
                      className="cursor-pointer rounded-3xl border p-5 shadow-sm flex flex-col justify-between gap-4 transition-all"
                      style={{
                        background: "var(--theme-card-bg)",
                        borderColor: "var(--theme-border)",
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 font-extrabold text-base">
                          {cls.classNumber || cls.name.replace(/Class\s*/i, "")}
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400">
                          {cls.totalBooks} Textbooks
                        </span>
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-[var(--theme-text)]">{cls.name}</h4>
                        <p className="text-xs text-[var(--theme-text-secondary)] mt-1">
                          {subjectKeys.length} Subjects: {subjectKeys.slice(0, 3).join(", ")}
                          {subjectKeys.length > 3 ? "..." : ""}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[var(--theme-border)] flex items-center justify-between text-xs font-semibold text-purple-400">
                        <span>Browse Subjects</span>
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
                  {classMap[selectedClass]?.totalBooks || 0} Textbooks Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Object.values(classMap[selectedClass]?.subjects || {}).map((subj) => {
                  const theme = getSubjectTheme(subj.name);
                  return (
                    <motion.div
                      key={subj.name}
                      whileHover={{ y: -3 }}
                      onClick={() => handleSelectSubject(subj.name)}
                      className="cursor-pointer rounded-3xl border p-6 shadow-sm flex flex-col justify-between gap-5 transition-all"
                      style={{
                        background: "var(--theme-card-bg)",
                        borderColor: "var(--theme-border)",
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${theme.bg} ${theme.text}`}>
                          <Folder className="h-6 w-6" />
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${theme.bg} ${theme.text}`}>
                          {subj.books.length} Books
                        </span>
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-[var(--theme-text)]">{subj.name}</h4>
                        <p className="text-xs text-[var(--theme-text-secondary)] mt-1">
                          Complete curriculum materials & multilingual editions
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[var(--theme-border)] flex items-center justify-between text-xs font-semibold text-sky-400">
                        <span>Open Subject Shelf</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW LEVEL 3: BOOK SELECTION GRID WITHIN SELECTED SUBJECT */}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {(classMap[selectedClass]?.subjects[selectedSubject]?.books || []).map((book) => {
                  const theme = getSubjectTheme(selectedSubject);
                  return (
                    <div
                      key={book.fullPath}
                      className="rounded-3xl border p-5 shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-md hover:-translate-y-1"
                      style={{
                        background: "var(--theme-card-bg)",
                        borderColor: "var(--theme-border)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${theme.bg} ${theme.text} flex-shrink-0`}>
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${theme.bg} ${theme.text} border ${theme.border}`}>
                          {book.language}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-[var(--theme-text)] line-clamp-2">
                          {book.title}
                        </h3>
                        <p className="text-xs text-[var(--theme-text-secondary)] mt-1">
                          {formatBytes(book.size)} · NCERT Official Cleaned Edition
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[var(--theme-border)] flex items-center justify-between">
                        <span className="text-[11px] text-[var(--theme-text-secondary)]">PDF Document</span>
                        <button
                          type="button"
                          onClick={() => onOpenPdf(book.publicUrl, book.title, book.className, book.subjectName)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold text-xs text-white bg-sky-600 hover:bg-sky-500 transition shadow-sm hover:scale-105"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>Read Book</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
