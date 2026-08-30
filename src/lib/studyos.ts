// StudyOS API Client & Learning Kit Integration Service
import {
  STUDYOS_CATALOG,
  NCERT_BOOK_CODE_MAP,
} from "./studyosCatalog";
import type { SubjectData, ChapterItem } from "./studyosCatalog";

export interface PYQQuestion {
  q_num: number;
  type: string; // 'MCQ' | 'VSA' | 'SA' | 'LA' | 'CBQ'
  marks: number;
  chapter_code: string;
  q: string;
  options: string[] | null;
  passage: string | null;
  year: number;
  set?: string | null;
}

export interface PYQStats {
  cache_key?: string;
  chapter_code?: string;
  total?: number;
  years?: number[];
  year_count?: number;
  types?: Record<string, number>;
  priority?: string;
}

export interface PYQResponse {
  questions: PYQQuestion[];
  has_premium: boolean;
  is_premium: boolean;
  total: number;
  stats?: PYQStats;
}

export interface FlashcardItem {
  front: string;
  back: string;
  hint?: string;
}

export interface MCQOptionItem {
  q_num?: number;
  question: string;
  options: string[];
  answer?: number | string;
  explanation?: string;
}

export interface ImportantQuestionItem {
  q_num?: number;
  type?: string;
  marks?: number;
  q?: string;
  question?: string;
  answer?: string;
  solution?: string;
  options?: string[];
  passage?: string;
  priority?: string;
}

export interface ChapterKitData {
  mind_map?: string;
  cheatsheet?: string;
  flashcards?: FlashcardItem[];
  mcqs?: MCQOptionItem[];
  important?: ImportantQuestionItem[];
  [key: string]: any;
}

const CACHE_PREFIX = "studyos_cache_";
const CACHE_EXPIRY_MS = 1000 * 60 * 60 * 24 * 3; // 3 days

interface CacheEnvelope<T> {
  timestamp: number;
  data: T;
}

function getFromCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const env: CacheEnvelope<T> = JSON.parse(raw);
    if (Date.now() - env.timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return env.data;
  } catch {
    return null;
  }
}

function setToCache<T>(key: string, data: T): void {
  try {
    const env: CacheEnvelope<T> = {
      timestamp: Date.now(),
      data,
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(env));
  } catch {
    // LocalStorage quota exceeded or private mode, gracefully skip
  }
}

/**
 * Build safe API endpoint URL, prioritizing relative proxy route
 */
function getApiEndpoint(path: string): string {
  // In browser, use proxy route /api/studyos
  return `/api/studyos${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Fetch Previous Year Questions for a chapter
 */
export async function fetchPYQs(
  cacheKey: string,
  chapterCode: string
): Promise<PYQResponse> {
  const cacheId = `pyq_${cacheKey}_${chapterCode}`;
  const cached = getFromCache<PYQResponse>(cacheId);
  if (cached) return cached;

  const url = getApiEndpoint(`/pyq/${cacheKey}/${chapterCode}`);
  const fallbackUrl = `https://www.studyos.co.in/api/pyq/${cacheKey}/${chapterCode}`;

  try {
    let res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok && res.status === 404) {
      // Try fallback direct if proxy had path mismatch
      res = await fetch(fallbackUrl, {
        headers: { Accept: "application/json" },
      });
    }

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    const data: PYQResponse = await res.json();
    setToCache(cacheId, data);
    return data;
  } catch (error) {
    console.error(`Failed to fetch PYQs for ${cacheKey}/${chapterCode}:`, error);
    throw error;
  }
}

/**
 * Fetch full Chapter Study Kit (Mindmap, Cheatsheet, Flashcards, MCQs, Important Questions)
 */
export async function fetchChapterKit(
  cacheKey: string,
  chapterCode: string
): Promise<ChapterKitData> {
  const cacheId = `kit_${cacheKey}_${chapterCode}`;
  const cached = getFromCache<ChapterKitData>(cacheId);
  if (cached) return cached;

  const url = getApiEndpoint(`/chapter/${cacheKey}/${chapterCode}`);
  const fallbackUrl = `https://www.studyos.co.in/api/chapter/${cacheKey}/${chapterCode}`;

  try {
    let res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok && res.status === 404) {
      res = await fetch(fallbackUrl, {
        headers: { Accept: "application/json" },
      });
    }

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    const raw: any = await res.json();
    const data: ChapterKitData = {
      mind_map: raw.mind_map || raw.mindmap || "",
      cheatsheet: raw.cheat_sheet || raw.cheatsheet || "",
      flashcards: raw.flashcards || [],
      mcqs: raw.mcqs || [],
      important: raw.important_questions || raw.important || [],
      notes: raw.notes || null,
      dpp_subtopics: raw.dpp_subtopics || [],
    };
    setToCache(cacheId, data);
    return data;
  } catch (error) {
    console.error(
      `Failed to fetch Chapter Kit for ${cacheKey}/${chapterCode}:`,
      error
    );
    throw error;
  }
}

/**
 * Matches an NCERT book or chapter from EduScrapeApp's Library/Reader to StudyOS Subject and Chapter
 */
export function findChaptersForBook(
  fullPathOrTitle: string,
  classNum?: string,
  subjectName?: string
): {
  subject: SubjectData;
  chapters: ChapterItem[];
  activeChapter?: ChapterItem;
} | null {
  const lower = fullPathOrTitle.toLowerCase();

  // 1. Direct NCERT code extraction (e.g. jesc1, jemh1, leph1, lech1, etc.)
  const codeMatch = lower.match(/([a-z]{4,5}\d{1,2})/);
  if (codeMatch) {
    const rawCode = codeMatch[1];
    // Check direct book code map
    const mapped = NCERT_BOOK_CODE_MAP[rawCode] || NCERT_BOOK_CODE_MAP[rawCode.slice(0, 5)];
    if (mapped && STUDYOS_CATALOG[mapped.cacheKey]) {
      const subj = STUDYOS_CATALOG[mapped.cacheKey];
      const allChapters = subj.groups.flatMap((g) => g.chapters);
      const active = allChapters.find(
        (c) => c.code.toLowerCase() === rawCode.toLowerCase()
      );
      return {
        subject: subj,
        chapters: allChapters,
        activeChapter: active || allChapters[0],
      };
    }
  }

  // 2. Match by Class & Subject
  let targetClass = classNum?.replace(/[^0-9]/g, "") || "";
  if (!targetClass) {
    const clsMatch = lower.match(/class\s*(\d+)/);
    if (clsMatch) targetClass = clsMatch[1];
  }

  // Look through catalog for matching subject
  for (const [cacheKey, subj] of Object.entries(STUDYOS_CATALOG)) {
    // Check if subject is from the target class
    const isMatchingClass =
      (!targetClass && !cacheKey.startsWith("c")) ||
      (targetClass === "10" && !cacheKey.startsWith("c")) ||
      (targetClass && cacheKey.startsWith(`c${targetClass}_`));

    if (!isMatchingClass) continue;

    // Check subject label or name
    const subjClean = subj.label.toLowerCase();
    const querySubj = (subjectName || "").toLowerCase();

    if (
      (querySubj && (subjClean.includes(querySubj) || querySubj.includes(subjClean))) ||
      lower.includes(subjClean) ||
      (subjClean === "mathematics" && lower.includes("math")) ||
      (subjClean === "science" && lower.includes("science"))
    ) {
      const allChapters = subj.groups.flatMap((g) => g.chapters);

      // Check if a specific chapter matches
      let active: ChapterItem | undefined;
      for (const ch of allChapters) {
        if (
          lower.includes(ch.name.toLowerCase()) ||
          ch.name.toLowerCase().includes(lower)
        ) {
          active = ch;
          break;
        }
      }

      return {
        subject: subj,
        chapters: allChapters,
        activeChapter: active || allChapters[0],
      };
    }
  }

  return null;
}

// ── Bookmark Storage Helpers ────────────────────────────────────────────────

const BOOKMARKS_KEY = "studyos_pyq_bookmarks";

export function getBookmarkedPYQs(): PYQQuestion[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isPYQBookmarked(q: PYQQuestion): boolean {
  const all = getBookmarkedPYQs();
  return all.some(
    (item) =>
      item.chapter_code === q.chapter_code &&
      item.q_num === q.q_num &&
      item.year === q.year
  );
}

export function toggleBookmarkPYQ(q: PYQQuestion): boolean {
  const all = getBookmarkedPYQs();
  const index = all.findIndex(
    (item) =>
      item.chapter_code === q.chapter_code &&
      item.q_num === q.q_num &&
      item.year === q.year
  );

  if (index >= 0) {
    all.splice(index, 1);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(all));
    return false;
  } else {
    all.unshift(q);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(all));
    return true;
  }
}
