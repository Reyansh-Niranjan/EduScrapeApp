import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  FileText,
  Sparkles,
  Layers,
  HelpCircle,
  Search,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  RotateCw,
  ChevronRight,
  Printer,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Flame,
  SlidersHorizontal,
  Lock,
  UserCheck,
} from "lucide-react";
import {
  STUDYOS_CATALOG,
  CLASS_SUBJECT_ORDERS,
  STREAM_SUBJECT_ORDERS,
  isBoardClass,
} from "../../lib/studyosCatalog";
import type {
  SubjectData,
  ChapterItem,
  ClassNumber,
  StreamKey,
} from "../../lib/studyosCatalog";
import {
  fetchPYQs,
  fetchChapterKit,
  getSubjectChapters,
  toggleBookmarkPYQ,
  isPYQBookmarked,
  getBookmarkedPYQs,
} from "../../lib/studyos";
import type {
  PYQQuestion,
  PYQResponse,
  ChapterKitData,
} from "../../lib/studyos";

export type StudyHubTab = "pyq" | "cheatsheet" | "flashcards" | "quiz" | "important" | "mindmap";

interface StudyHubProps {
  initialClass?: string;
  initialCacheKey?: string;
  initialChapterCode?: string;
  initialTab?: StudyHubTab;
  onClose?: () => void;
  onOpenPdfForChapter?: (chapterCode: string) => void;
}

const CLASS_OPTIONS: { key: ClassNumber; label: string; isBoard?: boolean }[] = [
  { key: "10", label: "Class 10", isBoard: true },
  { key: "12", label: "Class 12", isBoard: true },
  { key: "11", label: "Class 11" },
  { key: "9", label: "Class 9" },
  { key: "8", label: "Class 8" },
  { key: "7", label: "Class 7" },
  { key: "6", label: "Class 6" },
  { key: "5", label: "Class 5" },
];

export const StudyHub: React.FC<StudyHubProps> = ({
  initialClass = "10",
  initialCacheKey,
  initialChapterCode,
  initialTab,
  onClose,
  onOpenPdfForChapter,
}) => {
  const normClass = (CLASS_OPTIONS.some((c) => c.key === initialClass) ? initialClass : "10") as ClassNumber;
  const isInitialBoard = isBoardClass(normClass);

  const [selectedClass, setSelectedClass] = useState<ClassNumber>(normClass);
  const [selectedStream, setSelectedStream] = useState<StreamKey>("science");
  const [selectedCacheKey, setSelectedCacheKey] = useState<string>(
    initialCacheKey || (normClass === "12" ? "c12_physics" : normClass === "11" ? "c11_physics" : normClass === "10" ? "science" : `c${normClass}_mathematics`)
  );
  const [selectedChapterCode, setSelectedChapterCode] = useState<string>(
    initialChapterCode || ""
  );
  const [activeTab, setActiveTab] = useState<StudyHubTab>(
    initialTab || (isInitialBoard ? "pyq" : "cheatsheet")
  );

  // Data states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pyqData, setPyqData] = useState<PYQResponse | null>(null);
  const [kitData, setKitData] = useState<ChapterKitData | null>(null);

  // Filter states for PYQ
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedList, setBookmarkedList] = useState<PYQQuestion[]>([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Interactive MCQ solving states
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
  const [reviewLaterCards, setReviewLaterCards] = useState<Set<number>>(new Set());

  // Copy notification state
  const [copied, setCopied] = useState(false);

  // Chapter search state
  const [chapterSearch, setChapterSearch] = useState("");

  // Get available subjects for active class/stream
  const availableSubjectKeys = useMemo(() => {
    if (selectedClass === "11" || selectedClass === "12") {
      return STREAM_SUBJECT_ORDERS[selectedClass]?.[selectedStream] || [];
    }
    return CLASS_SUBJECT_ORDERS[selectedClass] || [];
  }, [selectedClass, selectedStream]);

  // Current Subject Data
  const currentSubject: SubjectData | undefined = STUDYOS_CATALOG[selectedCacheKey];

  // Rendered Groups / Chapters
  const renderedGroups = useMemo(() => {
    if (!currentSubject) return [];
    if (currentSubject.groups && currentSubject.groups.length > 0) {
      return currentSubject.groups;
    }
    if (currentSubject.chapters && currentSubject.chapters.length > 0) {
      return [{ label: null, chapters: currentSubject.chapters }];
    }
    return [];
  }, [currentSubject]);

  // Flattened chapters of current subject
  const allChapters = useMemo(() => {
    if (!currentSubject) return [];
    return getSubjectChapters(currentSubject);
  }, [currentSubject]);

  // Active Chapter Item
  const activeChapter: ChapterItem | undefined = useMemo(() => {
    if (!allChapters.length) return undefined;
    if (selectedChapterCode) {
      const found = allChapters.find((c) => c.code === selectedChapterCode);
      if (found) return found;
    }
    return allChapters[0];
  }, [allChapters, selectedChapterCode]);

  // Ensure valid subject when class or stream changes
  useEffect(() => {
    if (availableSubjectKeys.length > 0 && !availableSubjectKeys.includes(selectedCacheKey)) {
      setSelectedCacheKey(availableSubjectKeys[0]);
    }
  }, [selectedClass, selectedStream, availableSubjectKeys]);

  // Sync active chapter code when subject changes
  useEffect(() => {
    if (allChapters.length > 0) {
      if (!selectedChapterCode || !allChapters.some((c) => c.code === selectedChapterCode)) {
        setSelectedChapterCode(allChapters[0].code);
      }
    }
  }, [allChapters]);

  // Load PYQs and Chapter Kits on chapter change
  useEffect(() => {
    if (!selectedCacheKey || !activeChapter?.code) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setUserAnswers({});
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setBookmarkedList(getBookmarkedPYQs());

    const isBoardClass = selectedClass === "10" || selectedClass === "12";

    Promise.allSettled([
      isBoardClass ? fetchPYQs(selectedCacheKey, activeChapter.code) : Promise.resolve(null),
      fetchChapterKit(selectedCacheKey, activeChapter.code),
    ])
      .then(([pyqResult, kitResult]) => {
        if (!isMounted) return;

        if (pyqResult.status === "fulfilled" && pyqResult.value) {
          setPyqData(pyqResult.value);
        } else {
          setPyqData(null);
        }

        if (kitResult.status === "fulfilled" && kitResult.value) {
          setKitData(kitResult.value);
        } else {
          setKitData(null);
        }

        if (!isBoardClass && activeTab === "pyq") {
          setActiveTab("cheatsheet");
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Failed to load study materials.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCacheKey, activeChapter?.code, selectedClass]);

  // Filtered PYQ Questions
  const filteredQuestions = useMemo(() => {
    if (!pyqData?.questions) return [];
    let list = pyqData.questions;

    if (showBookmarksOnly) {
      list = list.filter((q) => isPYQBookmarked(q));
    }

    if (selectedYear !== "all") {
      list = list.filter((q) => String(q.year) === selectedYear);
    }

    if (selectedType !== "all") {
      list = list.filter((q) => (q.type || "").toUpperCase() === selectedType.toUpperCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.q.toLowerCase().includes(q) ||
          (item.passage && item.passage.toLowerCase().includes(q)) ||
          (item.options && item.options.some((opt) => opt.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [pyqData, selectedYear, selectedType, searchQuery, showBookmarksOnly, bookmarkedList]);

  const availableYears = useMemo(() => {
    if (!pyqData?.questions) return [];
    const years = new Set(pyqData.questions.map((q) => q.year).filter(Boolean));
    return Array.from(years).sort((a, b) => b - a);
  }, [pyqData]);

  const availableTypes = useMemo(() => {
    if (!pyqData?.questions) return [];
    const types = new Set(pyqData.questions.map((q) => (q.type || "Q").toUpperCase()));
    return Array.from(types);
  }, [pyqData]);

  const handleBookmarkToggle = (q: PYQQuestion) => {
    toggleBookmarkPYQ(q);
    setBookmarkedList(getBookmarkedPYQs());
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-muted font-sans">
      {/* Telemetry Faux-OS Header Bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md px-4 py-3 sm:px-6 safe-top">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors active:scale-95"
                title="Back"
                aria-label="Back"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Faux-OS Window Dots */}
            <div className="hidden sm:flex items-center gap-1.5 mr-1">
              <span className="h-2 w-2 rounded-full bg-border" />
              <span className="h-2 w-2 rounded-full bg-border" />
              <span className="h-2 w-2 rounded-full bg-border" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  edu://cbse.ncert/pyq-archive
                </span>
                <span className="inline-flex items-center gap-1 rounded-sm bg-[var(--pastel-green-bg)] px-1.5 py-0.5 text-[10px] font-mono font-medium text-[var(--pastel-green-text)] border border-border">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live Indexed
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-foreground">
                Board Exam PYQs & Study Kit Laboratory
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer active:scale-98"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Worksheet</span>
            </button>
            {activeChapter && onOpenPdfForChapter && (
              <button
                type="button"
                onClick={() => onOpenPdfForChapter(activeChapter.code)}
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-md font-medium text-xs text-primary-foreground bg-primary hover:opacity-90 transition-opacity active:scale-97 cursor-pointer shadow-xs"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Open Textbook</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Class & Stream Telemetry Selector */}
      <section className="border-b border-border bg-secondary/30 px-4 py-2.5 sm:px-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Class Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none font-mono">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1.5 font-bold">
              Class:
            </span>
            {CLASS_OPTIONS.map((cls) => (
              <button
                key={cls.key}
                type="button"
                onClick={() => setSelectedClass(cls.key)}
                className={`px-2.5 py-1 rounded-sm text-xs transition-colors cursor-pointer ${
                  selectedClass === cls.key
                    ? "bg-foreground text-background font-bold shadow-xs"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {cls.label}
                {cls.isBoard && (
                  <span className="ml-1 text-[9px] text-[var(--pastel-amber-text)]">•</span>
                )}
              </button>
            ))}
          </div>

          {/* Stream Selector for 11 & 12 */}
          {(selectedClass === "11" || selectedClass === "12") && (
            <div className="flex items-center gap-1 font-mono text-xs">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1">
                Stream:
              </span>
              {(["science", "commerce", "humanities"] as StreamKey[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStream(st)}
                  className={`px-2 py-0.5 rounded-sm capitalize transition-colors ${
                    selectedStream === st
                      ? "bg-foreground text-background font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Subject Filter Bar */}
      <section className="border-b border-border bg-card px-4 py-2 sm:px-6">
        <div className="mx-auto max-w-7xl flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mr-1">
            Subject:
          </span>
          {availableSubjectKeys.map((key) => {
            const subj = STUDYOS_CATALOG[key];
            if (!subj) return null;
            const isSelected = selectedCacheKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCacheKey(key)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs transition-colors cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <span>{subj.icon}</span>
                <span>{subj.label}</span>
                <span className="text-[10px] opacity-60 font-mono">
                  [{getSubjectChapters(subj).length}]
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Grid Workspace */}
      <main className="mx-auto max-w-7xl w-full flex-1 px-4 py-6 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Chapters Navigation (4 cols) */}
        <aside className="lg:col-span-4 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              {currentSubject?.label} Taxonomy
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              {allChapters.length} Chapters
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter by title or code..."
              value={chapterSearch}
              onChange={(e) => setChapterSearch(e.target.value)}
              className="w-full rounded-md border border-border bg-card pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
            />
          </div>

          {/* Chapter Items List */}
          <div className="flex flex-col gap-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {renderedGroups.map((group, gIdx) => {
              const matching = (group.chapters || []).filter(
                (ch) =>
                  !chapterSearch.trim() ||
                  ch.name.toLowerCase().includes(chapterSearch.toLowerCase()) ||
                  ch.code.toLowerCase().includes(chapterSearch.toLowerCase())
              );

              if (!matching.length) return null;

              return (
                <div key={gIdx} className="space-y-1">
                  {group.label && (
                    <div className="px-2 py-1 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider bg-secondary/50 rounded-xs">
                      {group.label}
                    </div>
                  )}
                  {matching.map((ch, idx) => {
                    const isSelected = activeChapter?.code === ch.code;
                    return (
                      <button
                        key={ch.code}
                        type="button"
                        onClick={() => setSelectedChapterCode(ch.code)}
                        className={`w-full flex items-start gap-2.5 text-left p-2.5 rounded-md border transition-colors cursor-pointer ${
                          isSelected
                            ? "border-foreground bg-card text-foreground font-semibold shadow-xs"
                            : "border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                        }`}
                      >
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-xs bg-secondary text-[9px] font-mono font-bold text-muted-foreground mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs leading-snug line-clamp-2">{ch.name}</p>
                          <span className="text-[10px] font-mono text-muted-foreground mt-0.5 inline-block uppercase">
                            CODE: {ch.code}
                          </span>
                        </div>
                        {isSelected && (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-foreground" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Column: Active Study & PYQ Terminal (8 cols) */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          {/* Active Chapter Header Card */}
          <div className="rounded-md border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  <span>Class {selectedClass}</span>
                  <span>/</span>
                  <span>{currentSubject?.label}</span>
                  <span>/</span>
                  <span className="text-foreground font-bold">{activeChapter?.code}</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  {activeChapter?.name}
                </h2>
              </div>

              {/* Board Statistics or Curriculum Badge */}
              {isBoardClass(selectedClass) && pyqData?.stats ? (
                <div className="flex items-center gap-2.5 rounded-sm border border-border bg-secondary/60 px-3 py-1.5 text-xs font-mono">
                  <div className="text-right">
                    <span className="text-foreground font-bold">{pyqData.stats.total || pyqData.total}</span>
                    <span className="text-muted-foreground text-[10px] block">Questions</span>
                  </div>
                  <div className="h-6 w-px bg-border" />
                  <div className="text-left text-[10px] text-muted-foreground">
                    <span className="text-foreground font-semibold block">CBSE 2023+</span>
                    <span>{pyqData.stats.types ? Object.keys(pyqData.stats.types).join(" · ") : "Board Sets"}</span>
                  </div>
                </div>
              ) : !isBoardClass(selectedClass) ? (
                <div className="flex items-center gap-2 rounded-sm border border-border bg-secondary/50 px-3 py-1.5 text-xs font-mono text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-[var(--pastel-green-text)] animate-pulse" />
                  <span>NCERT Study Kit & Cheatsheet</span>
                </div>
              ) : null}
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none font-mono text-xs">
              {isBoardClass(selectedClass) && (
                <button
                  type="button"
                  onClick={() => setActiveTab("pyq")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === "pyq"
                      ? "bg-foreground text-background font-bold shadow-xs"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Flame className="h-3 w-3" />
                  <span>Board PYQs</span>
                  {pyqData?.questions?.length ? (
                    <span className="ml-1 text-[10px] opacity-75">
                      [{pyqData.questions.length}]
                    </span>
                  ) : null}
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab("cheatsheet")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "cheatsheet"
                    ? "bg-foreground text-background font-bold shadow-xs"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <FileText className="h-3 w-3" />
                <span>Smart Notes</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("flashcards")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "flashcards"
                    ? "bg-foreground text-background font-bold shadow-xs"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Layers className="h-3 w-3" />
                <span>3D Flashcards</span>
                {kitData?.flashcards?.length ? (
                  <span className="ml-1 text-[10px] opacity-75">
                    [{kitData.flashcards.length}]
                  </span>
                ) : null}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("quiz")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "quiz"
                    ? "bg-foreground text-background font-bold shadow-xs"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>MCQ Quiz</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("important")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "important"
                    ? "bg-foreground text-background font-bold shadow-xs"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Sparkles className="h-3 w-3" />
                <span>Important Qs</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("mindmap")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "mindmap"
                    ? "bg-foreground text-background font-bold shadow-xs"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <SlidersHorizontal className="h-3 w-3" />
                <span>Mind Map</span>
              </button>
            </div>
          </div>

          {/* Loading View */}
          {loading && (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-md border border-border bg-card p-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-foreground mb-3" />
              <p className="text-xs font-mono uppercase tracking-wider text-foreground">
                Syncing curriculum index for {activeChapter?.code}...
              </p>
            </div>
          )}

          {/* Auth Required View */}
          {!loading && error && error.includes("AUTH_REQUIRED") && (
            <div className="rounded-md border border-border bg-card p-6 sm:p-8 text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-foreground">
                <Lock className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className="text-sm sm:text-base font-bold text-foreground">Authentication Required</h3>
                <p className="text-xs text-muted-foreground">
                  Access to StudyOS past year board questions, formula sheets, and 3D flashcards requires an authenticated NovaSlate account.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="#login"
                  className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-xs font-bold text-background hover:opacity-90 transition-opacity"
                >
                  <UserCheck className="h-3.5 w-3.5" /> Sign In to NovaSlate
                </a>
              </div>
            </div>
          )}

          {/* Generic Error View */}
          {!loading && error && !error.includes("AUTH_REQUIRED") && (
            <div className="rounded-md border border-border bg-[var(--pastel-red-bg)] p-4 text-[var(--pastel-red-text)] flex items-start gap-3 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Telecommunication Error</p>
                <p className="mt-0.5">{error}</p>
                <button
                  type="button"
                  onClick={() => setSelectedChapterCode(activeChapter?.code || "")}
                  className="mt-2.5 inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2.5 py-1 text-xs text-foreground font-medium hover:bg-secondary"
                >
                  <RotateCw className="h-3 w-3" /> Retry Sync
                </button>
              </div>
            </div>
          )}

          {/* Content Pane */}
          {!loading && !error && (
            <div className="space-y-4">
              {/* ── 1. BOARD PYQS TAB ──────────────────────────────────────── */}
              {activeTab === "pyq" && (
                <div className="space-y-3.5">
                  {/* Filter Toolbar */}
                  <div className="rounded-md border border-border bg-card p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <span className="text-muted-foreground uppercase">Year:</span>
                        <select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                          className="rounded-sm border border-border bg-background px-2 py-0.5 text-xs text-foreground focus:outline-none"
                        >
                          <option value="all">All Sets</option>
                          {availableYears.map((y) => (
                            <option key={y} value={String(y)}>
                              CBSE {y}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <span className="text-muted-foreground uppercase">Type:</span>
                        <select
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="rounded-sm border border-border bg-background px-2 py-0.5 text-xs text-foreground focus:outline-none"
                        >
                          <option value="all">All Formats</option>
                          {availableTypes.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border text-[11px] font-mono transition-colors ${
                          showBookmarksOnly
                            ? "bg-[var(--pastel-amber-bg)] text-[var(--pastel-amber-text)] border-border font-bold"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Bookmark className="h-3 w-3" />
                        <span>Saved ({bookmarkedList.length})</span>
                      </button>
                    </div>

                    <div className="relative w-full sm:w-48">
                      <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search question..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-sm border border-border bg-background pl-7 pr-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Question Cards */}
                  {filteredQuestions.length === 0 ? (
                    <div className="rounded-md border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
                      <HelpCircle className="mx-auto h-7 w-7 opacity-40 mb-2" />
                      <p className="text-xs font-semibold text-foreground">No questions match filter criteria</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredQuestions.map((q, idx) => {
                        const isBookmarked = isPYQBookmarked(q);
                        const userSelected = userAnswers[`${q.year}_${q.q_num}`];

                        return (
                          <div
                            key={`${q.year}_${q.q_num}_${idx}`}
                            className="rounded-md border border-border bg-card p-4 sm:p-5 space-y-3 transition-colors hover:border-foreground/40"
                          >
                            {/* Question Header */}
                            <div className="flex items-center justify-between gap-2 border-b border-border pb-2.5">
                              <div className="flex items-center gap-1.5 flex-wrap font-mono text-[10px]">
                                <span className="px-1.5 py-0.5 rounded-xs bg-[var(--pastel-amber-bg)] text-[var(--pastel-amber-text)] font-bold">
                                  CBSE {q.year}
                                </span>
                                <span className="px-1.5 py-0.5 rounded-xs bg-[var(--pastel-blue-bg)] text-[var(--pastel-blue-text)] font-semibold uppercase">
                                  {q.type || "Q"}
                                </span>
                                <span className="px-1.5 py-0.5 rounded-xs bg-secondary text-muted-foreground font-semibold">
                                  {q.marks || 1}M
                                </span>
                                {q.set && (
                                  <span className="text-muted-foreground">SET {q.set}</span>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(q.q)}
                                  className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                  title="Copy text"
                                >
                                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleBookmarkToggle(q)}
                                  className={`p-1 rounded-sm transition-colors ${
                                    isBookmarked
                                      ? "text-[var(--pastel-amber-text)] bg-[var(--pastel-amber-bg)]"
                                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                  }`}
                                  title={isBookmarked ? "Remove Bookmark" : "Bookmark"}
                                >
                                  {isBookmarked ? (
                                    <BookmarkCheck className="h-3.5 w-3.5" />
                                  ) : (
                                    <Bookmark className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Passage for case studies */}
                            {q.passage && (
                              <div className="rounded-sm border border-border bg-secondary/30 p-3 text-xs leading-relaxed text-muted-foreground font-mono">
                                <span className="font-bold text-foreground block mb-1">Source Text:</span>
                                {q.passage}
                              </div>
                            )}

                            {/* Question Body */}
                            <p className="text-xs sm:text-sm font-semibold leading-relaxed text-foreground">
                              <span className="font-mono text-muted-foreground mr-1">Q{q.q_num}.</span>
                              {q.q}
                            </p>

                            {/* MCQ Options */}
                            {q.options && q.options.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border">
                                {q.options.map((opt, oIdx) => {
                                  const isSelected = userSelected === oIdx;
                                  return (
                                    <button
                                      key={oIdx}
                                      type="button"
                                      onClick={() =>
                                        setUserAnswers((prev) => ({
                                          ...prev,
                                          [`${q.year}_${q.q_num}`]: oIdx,
                                        }))
                                      }
                                      className={`flex items-start gap-2 text-left p-2 rounded-sm border text-xs leading-snug transition-colors cursor-pointer ${
                                        isSelected
                                          ? "border-foreground bg-foreground text-background font-semibold"
                                          : "border-border bg-secondary/20 hover:bg-secondary/60 text-foreground"
                                      }`}
                                    >
                                      <span
                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-xs text-[10px] font-mono font-bold ${
                                          isSelected
                                            ? "bg-background text-foreground"
                                            : "bg-secondary text-muted-foreground"
                                        }`}
                                      >
                                        {String.fromCharCode(65 + oIdx)}
                                      </span>
                                      <span className="flex-1">{opt}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── 2. SMART NOTES TAB ────────────────────────────────────── */}
              {activeTab === "cheatsheet" && (
                <div className="space-y-4">
                  {/* Top Action Bar */}
                  <div className="flex items-center justify-between rounded-md border border-border bg-card p-3 shadow-xs">
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-bold">
                      Curriculum Synthesis & Key Formulas
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(kitData?.cheatsheet || JSON.stringify(kitData?.notes || "", null, 2))}
                      className="text-xs font-mono text-foreground hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="h-3 w-3" /> Copy Full Notes
                    </button>
                  </div>

                  {/* Structured Notes if available */}
                  {kitData?.notes ? (
                    <div className="space-y-4">
                      {kitData.notes.overview && (
                        <div className="rounded-md border border-border bg-card p-4 space-y-1.5 shadow-xs">
                          <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                            Chapter Overview
                          </h4>
                          <p className="text-xs sm:text-sm leading-relaxed text-foreground">
                            {kitData.notes.overview}
                          </p>
                        </div>
                      )}

                      {kitData.notes.formulas && (
                        <div className="rounded-md border border-border bg-card p-4 space-y-2 shadow-xs">
                          <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--pastel-blue-text)] font-bold flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-[var(--pastel-blue-text)]" />
                            Key Formulas & Equations
                          </h4>
                          <div className="rounded-sm border border-border bg-secondary/30 p-3 font-mono text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                            {typeof kitData.notes.formulas === "string"
                              ? kitData.notes.formulas
                              : JSON.stringify(kitData.notes.formulas, null, 2)}
                          </div>
                        </div>
                      )}

                      {kitData.notes.exam_traps && (
                        <div className="rounded-md border border-border bg-[var(--pastel-red-bg)] p-4 space-y-1.5 text-[var(--pastel-red-text)]">
                          <h4 className="text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Common Exam Traps & Mistakes
                          </h4>
                          <p className="text-xs sm:text-sm leading-relaxed">
                            {typeof kitData.notes.exam_traps === "string"
                              ? kitData.notes.exam_traps
                              : JSON.stringify(kitData.notes.exam_traps, null, 2)}
                          </p>
                        </div>
                      )}

                      {kitData.notes.board_exam_focus && (
                        <div className="rounded-md border border-border bg-[var(--pastel-amber-bg)] p-4 space-y-1.5 text-[var(--pastel-amber-text)]">
                          <h4 className="text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5">
                            <Flame className="h-3.5 w-3.5" />
                            High-Yield Board Exam Focus
                          </h4>
                          <p className="text-xs sm:text-sm leading-relaxed">
                            {typeof kitData.notes.board_exam_focus === "string"
                              ? kitData.notes.board_exam_focus
                              : JSON.stringify(kitData.notes.board_exam_focus, null, 2)}
                          </p>
                        </div>
                      )}

                      {kitData.cheatsheet && (
                        <div className="rounded-md border border-border bg-card p-5 space-y-3 shadow-xs">
                          <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                            Comprehensive Markdown Cheatsheet
                          </h4>
                          <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground">
                            {kitData.cheatsheet}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : kitData?.cheatsheet ? (
                    <div className="rounded-md border border-border bg-card p-5 space-y-4 shadow-xs">
                      <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground">
                        {kitData.cheatsheet}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-md border border-border bg-card p-8 text-center text-xs text-muted-foreground font-mono">
                      No smart notes available for this chapter code.
                    </div>
                  )}
                </div>
              )}

              {/* ── 3. 3D FLASHCARDS TAB ──────────────────────────────────── */}
              {activeTab === "flashcards" && (
                <div className="space-y-4">
                  {kitData?.flashcards && kitData.flashcards.length > 0 ? (
                    <div className="flex flex-col items-center gap-4">
                      {/* Telemetry Header */}
                      <div className="flex items-center justify-between w-full max-w-md font-mono text-xs text-muted-foreground">
                        <span>
                          Index: {currentCardIndex + 1} / {kitData.flashcards.length}
                        </span>
                        <div className="flex gap-2">
                          <span className="text-[var(--pastel-green-text)] font-bold">
                            ✓ {knownCards.size} Mastered
                          </span>
                          <span className="text-[var(--pastel-red-text)] font-bold">
                            ↺ {reviewLaterCards.size} Review
                          </span>
                        </div>
                      </div>

                      {/* 3D Flip Card */}
                      <div
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="relative w-full max-w-md h-60 cursor-pointer select-none"
                        style={{ perspective: "1000px" }}
                      >
                        <div
                          className="w-full h-full relative rounded-md border border-border shadow-xs transition-transform duration-500"
                          style={{
                            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                            transformStyle: "preserve-3d",
                          }}
                        >
                          {/* FRONT */}
                          <div
                            className={`absolute inset-0 rounded-md p-6 flex flex-col justify-between bg-card border border-border backface-hidden ${
                              isFlipped ? "pointer-events-none" : ""
                            }`}
                            style={{ backfaceVisibility: "hidden" }}
                          >
                            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                              Prompt (Click to Invert)
                            </span>
                            <p className="text-sm sm:text-base font-bold text-center text-foreground leading-relaxed my-auto">
                              {kitData.flashcards[currentCardIndex]?.front}
                            </p>
                            <span className="text-[11px] text-center text-muted-foreground font-mono">
                              {kitData.flashcards[currentCardIndex]?.hint || "Tap anywhere to flip"}
                            </span>
                          </div>

                          {/* BACK */}
                          <div
                            className={`absolute inset-0 rounded-md p-6 flex flex-col justify-between bg-secondary/40 border border-border backface-hidden ${
                              !isFlipped ? "pointer-events-none" : ""
                            }`}
                            style={{
                              transform: "rotateY(180deg)",
                              backfaceVisibility: "hidden",
                            }}
                          >
                            <span className="font-mono text-[10px] uppercase tracking-wider text-foreground font-bold">
                              Verification / Answer
                            </span>
                            <p className="text-xs sm:text-sm font-semibold text-center text-foreground leading-relaxed my-auto">
                              {kitData.flashcards[currentCardIndex]?.back}
                            </p>
                            <span className="text-[11px] text-center text-muted-foreground font-mono">
                              Tap to return
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Controls */}
                      <div className="flex items-center gap-3 w-full max-w-md">
                        <button
                          type="button"
                          onClick={() => {
                            setReviewLaterCards((prev) => new Set(prev).add(currentCardIndex));
                            knownCards.delete(currentCardIndex);
                            setIsFlipped(false);
                            if (currentCardIndex < kitData.flashcards!.length - 1) {
                              setCurrentCardIndex((i) => i + 1);
                            }
                          }}
                          className="flex-1 rounded-md border border-border bg-[var(--pastel-red-bg)] text-[var(--pastel-red-text)] py-2 text-xs font-mono font-bold hover:opacity-90 active:scale-98 transition-all"
                        >
                          ↺ Mark Review
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setKnownCards((prev) => new Set(prev).add(currentCardIndex));
                            reviewLaterCards.delete(currentCardIndex);
                            setIsFlipped(false);
                            if (currentCardIndex < kitData.flashcards!.length - 1) {
                              setCurrentCardIndex((i) => i + 1);
                            }
                          }}
                          className="flex-1 rounded-md border border-border bg-[var(--pastel-green-bg)] text-[var(--pastel-green-text)] py-2 text-xs font-mono font-bold hover:opacity-90 active:scale-98 transition-all"
                        >
                          ✓ Mastered
                        </button>
                      </div>

                      {/* Step Controls */}
                      <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                        <button
                          type="button"
                          disabled={currentCardIndex === 0}
                          onClick={() => {
                            setIsFlipped(false);
                            setCurrentCardIndex((i) => Math.max(0, i - 1));
                          }}
                          className="hover:text-foreground disabled:opacity-30 cursor-pointer"
                        >
                          ← Prev
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          disabled={currentCardIndex === kitData.flashcards.length - 1}
                          onClick={() => {
                            setIsFlipped(false);
                            setCurrentCardIndex((i) =>
                              Math.min(kitData.flashcards!.length - 1, i + 1)
                            );
                          }}
                          className="hover:text-foreground disabled:opacity-30 cursor-pointer"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed border-border p-10 text-center text-muted-foreground">
                      <Layers className="mx-auto h-7 w-7 opacity-40 mb-2" />
                      <p className="text-xs">No flashcards indexed</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── 4. MCQ QUIZ TAB ───────────────────────────────────────── */}
              {activeTab === "quiz" && (
                <div className="space-y-3">
                  {kitData?.mcqs && kitData.mcqs.length > 0 ? (
                    kitData.mcqs.map((mcq, idx) => {
                      const answerKey = `quiz_${idx}`;
                      const selected = userAnswers[answerKey];

                      return (
                        <div
                          key={idx}
                          className="rounded-md border border-border bg-card p-4 space-y-3"
                        >
                          <span className="font-mono text-[10px] uppercase text-muted-foreground font-bold">
                            Question {idx + 1}
                          </span>
                          <p className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed">
                            {mcq.question}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {mcq.options?.map((opt, oIdx) => {
                              const isSelected = selected === oIdx;
                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  onClick={() =>
                                    setUserAnswers((prev) => ({
                                      ...prev,
                                      [answerKey]: oIdx,
                                    }))
                                  }
                                  className={`flex items-start gap-2 text-left p-2 rounded-sm border text-xs leading-snug transition-colors cursor-pointer ${
                                    isSelected
                                      ? "border-foreground bg-foreground text-background font-semibold"
                                      : "border-border bg-secondary/20 hover:bg-secondary/60 text-foreground"
                                  }`}
                                >
                                  <span
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-xs text-[10px] font-mono font-bold ${
                                      isSelected
                                        ? "bg-background text-foreground"
                                        : "bg-secondary text-muted-foreground"
                                    }`}
                                  >
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span className="flex-1">{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          {selected !== undefined && mcq.explanation && (
                            <div className="mt-2 rounded-sm border border-border bg-[var(--pastel-blue-bg)] p-2.5 text-xs text-[var(--pastel-blue-text)] leading-relaxed font-mono">
                              <span className="font-bold block mb-0.5">Verification:</span>
                              {mcq.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-md border border-dashed border-border p-10 text-center text-muted-foreground">
                      <p className="text-xs">No quiz questions indexed</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── 5. IMPORTANT QUESTIONS TAB ────────────────────────────── */}
              {activeTab === "important" && (
                <div className="space-y-3">
                  {kitData?.important && kitData.important.length > 0 ? (
                    kitData.important.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-md border border-border bg-card p-4 space-y-2.5"
                      >
                        <div className="flex items-center gap-2 font-mono text-[10px]">
                          <span className="px-1.5 py-0.5 rounded-xs bg-[var(--pastel-blue-bg)] text-[var(--pastel-blue-text)] font-bold">
                            {item.marks ? `${item.marks}M Key Target` : "High Yield"}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-foreground leading-relaxed">
                          {item.q || item.question}
                        </p>
                        {(item.answer || item.solution) && (
                          <div className="rounded-sm border border-border bg-secondary/30 p-3 text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                            <span className="font-mono text-[10px] uppercase text-muted-foreground block mb-1 font-bold">
                              Model Solution:
                            </span>
                            {item.answer || item.solution}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-md border border-dashed border-border p-10 text-center text-muted-foreground">
                      <p className="text-xs">No important questions indexed</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── 6. MIND MAP TAB ───────────────────────────────────────── */}
              {activeTab === "mindmap" && (
                <div className="rounded-md border border-border bg-card p-5 space-y-3">
                  <div className="border-b border-border pb-2">
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-bold">
                      Hierarchical Structural Map
                    </span>
                  </div>
                  {kitData?.mind_map ? (
                    <pre className="font-mono text-xs leading-relaxed bg-secondary/30 p-4 rounded-sm border border-border whitespace-pre-wrap overflow-x-auto text-foreground">
                      {kitData.mind_map}
                    </pre>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No structural mind map available.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
export default StudyHub;
