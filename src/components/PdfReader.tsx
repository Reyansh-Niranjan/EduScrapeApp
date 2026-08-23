import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCw,
  Download,
  X,
  Loader2,
  Sun,
  Moon,
  Eye,
  AlertCircle,
  FileText,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker with matching version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PdfReaderProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
  className?: string;
  subject?: string;
}

type ReadingTheme = "light" | "dark" | "sepia" | "charcoal";

export const PdfReader: React.FC<PdfReaderProps> = ({
  isOpen,
  onClose,
  pdfUrl,
  title,
  className = "",
  subject = "",
}) => {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>("dark");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [pageInputValue, setPageInputValue] = useState<string>("1");
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mainViewportRef = useRef<HTMLElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Load PDF Document
  useEffect(() => {
    if (!isOpen || !pdfUrl) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setCurrentPage(1);
    setPageInputValue("1");

    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl,
      cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@legacy/cmaps/",
      cMapPacked: true,
    });

    loadingTask.promise
      .then((doc) => {
        if (!isMounted) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("PDF.js loading error:", err);
        setError("Failed to load PDF stream. You can download the textbook directly.");
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
      loadingTask.destroy();
    };
  }, [isOpen, pdfUrl]);

  // Fit to Width Handler
  const handleFitToWidth = useCallback(async () => {
    if (!pdfDoc || !mainViewportRef.current) return;
    try {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1.0, rotation });
      const availableWidth = mainViewportRef.current.clientWidth - 48; // padding
      if (availableWidth > 0 && viewport.width > 0) {
        const calculatedScale = Math.min(Math.max(availableWidth / viewport.width, 0.6), 2.5);
        setScale(parseFloat(calculatedScale.toFixed(2)));
      }
    } catch (e) {
      console.warn("Fit to width error:", e);
    }
  }, [pdfDoc, currentPage, rotation]);

  // Render Page onto Canvas
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDoc || !canvasRef.current) return;

      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const viewport = page.getViewport({ scale, rotation });
        const outputScale = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(outputScale, 0, 0, outputScale, 0, 0);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
          canvas: canvas,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
      } catch (err: any) {
        if (err.name !== "RenderingCancelledException") {
          console.error("PDF render error:", err);
        }
      }
    },
    [pdfDoc, scale, rotation]
  );

  useEffect(() => {
    if (pdfDoc && currentPage > 0) {
      renderPage(currentPage);
      setPageInputValue(String(currentPage));
      // Scroll to top of viewport when page changes
      if (mainViewportRef.current) {
        mainViewportRef.current.scrollTop = 0;
      }
    }
  }, [pdfDoc, currentPage, scale, rotation, renderPage]);

  // Navigation handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePageJump = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(pageInputValue, 10);
    if (!isNaN(page) && page >= 1 && page <= numPages) {
      setCurrentPage(page);
    } else {
      setPageInputValue(String(currentPage));
    }
  };

  const handleZoomIn = () => setScale((prev) => Math.min(parseFloat((prev + 0.2).toFixed(2)), 3.0));
  const handleZoomOut = () => setScale((prev) => Math.max(parseFloat((prev - 0.2).toFixed(2)), 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in the jump input
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;

      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === "l" || e.key === "j") {
        handleNextPage();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp" || e.key === "h" || e.key === "k") {
        handlePrevPage();
      } else if (e.key === "Escape" && !document.fullscreenElement) {
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "0") {
        handleFitToWidth();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === "t" || e.key === "T") {
        setReadingTheme((prev) => {
          if (prev === "dark") return "sepia";
          if (prev === "sepia") return "charcoal";
          if (prev === "charcoal") return "light";
          return "dark";
        });
      } else if (e.key === "?") {
        setShowShortcuts((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentPage, numPages, onClose, handleFitToWidth]);

  if (!isOpen) return null;

  const getThemeCanvasFilter = () => {
    switch (readingTheme) {
      case "dark":
        return "invert(0.92) hue-rotate(180deg) brightness(0.95) contrast(1.1)";
      case "sepia":
        return "sepia(0.4) brightness(0.96) contrast(0.95)";
      case "charcoal":
        return "invert(0.85) hue-rotate(190deg) brightness(0.85) contrast(1.2)";
      default:
        return "none";
    }
  };

  const getThemeBg = () => {
    switch (readingTheme) {
      case "dark":
        return "bg-slate-950";
      case "sepia":
        return "bg-[#f5ebd7]";
      case "charcoal":
        return "bg-zinc-900";
      default:
        return "bg-slate-100";
    }
  };

  const percentProgress = numPages > 0 ? Math.round((currentPage / numPages) * 100) : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-xl select-none"
        ref={containerRef}
      >
        {/* Top Reading Progress Bar */}
        <div className="h-1.5 w-full bg-white/10 relative overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-teal-400 to-indigo-500 shadow-sm shadow-purple-500/50"
            initial={{ width: 0 }}
            animate={{ width: `${percentProgress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Top Header Control Bar */}
        <header className="flex h-14 items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 text-white shadow-xl backdrop-blur-2xl">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/25 shadow-inner flex-shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div className="truncate">
              <h2 className="truncate text-xs sm:text-sm font-bold tracking-tight text-white">
                {title}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                {(className || subject) && (
                  <span className="truncate text-[11px] text-slate-400">
                    {className} {subject ? `• ${subject}` : ""}
                  </span>
                )}
                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/15 px-1.5 py-0.2 rounded-md">
                  {percentProgress}% Read
                </span>
              </div>
            </div>
          </div>

          {/* Center Pagination Jump */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1 || isLoading}
              className="rounded-xl p-1.5 text-slate-300 transition hover:bg-white/10 active:scale-95 disabled:opacity-30"
              title="Previous Page (← or J)"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <form onSubmit={handlePageJump} className="flex items-center space-x-1">
              <input
                type="text"
                value={pageInputValue}
                onChange={(e) => setPageInputValue(e.target.value)}
                onBlur={handlePageJump}
                disabled={isLoading || numPages === 0}
                className="h-7 w-12 rounded-lg border border-white/15 bg-white/10 text-center text-xs font-bold text-white transition focus:border-purple-400 focus:bg-white/15 focus:outline-none"
              />
              <span className="text-xs font-medium text-slate-400">/ {numPages || "--"}</span>
            </form>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= numPages || isLoading}
              className="rounded-xl p-1.5 text-slate-300 transition hover:bg-white/10 active:scale-95 disabled:opacity-30"
              title="Next Page (→ or K)"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Reading Theme Toggle */}
            <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-0.5">
              <button
                onClick={() => setReadingTheme("light")}
                className={`rounded-lg p-1.5 transition ${
                  readingTheme === "light" ? "bg-purple-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
                title="Light Theme"
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setReadingTheme("sepia")}
                className={`rounded-lg p-1.5 transition ${
                  readingTheme === "sepia" ? "bg-amber-700 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
                title="Sepia Paper Mode"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setReadingTheme("dark")}
                className={`rounded-lg p-1.5 transition ${
                  readingTheme === "dark" ? "bg-purple-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
                title="OLED Dark Mode"
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="hidden items-center space-x-1 sm:flex rounded-xl border border-white/10 bg-white/5 p-0.5">
              <button
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 disabled:opacity-30"
                title="Zoom Out (-)"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleFitToWidth}
                className="px-2 py-1 text-[11px] font-bold font-mono text-purple-300 hover:text-white transition"
                title="Fit Width (Press 0)"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                onClick={handleZoomIn}
                disabled={scale >= 3.0}
                className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 disabled:opacity-30"
                title="Zoom In (+)"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleRotate}
                className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10"
                title="Rotate 90°"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Keyboard Shortcuts Dialog Toggle */}
            <button
              onClick={() => setShowShortcuts((prev) => !prev)}
              className="hidden sm:block rounded-xl p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              title="Keyboard Shortcuts (?)"
            >
              <HelpCircle className="h-4 w-4" />
            </button>

            {/* Download */}
            <a
              href={pdfUrl}
              download={`${title}.pdf`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
            </a>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="hidden rounded-xl p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white sm:block"
              title="Fullscreen Toggle (F)"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="rounded-xl bg-red-500/20 p-1.5 text-red-400 transition hover:bg-red-500/30 hover:text-red-300 active:scale-95"
              title="Close Reader (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* PDF Document Canvas Viewport */}
        <main
          ref={mainViewportRef}
          className={`relative flex flex-1 items-center justify-center overflow-auto p-4 sm:p-8 transition-colors duration-300 ${getThemeBg()}`}
        >
          {isLoading && (
            <div className="flex flex-col items-center space-y-3 text-slate-300 p-8 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl shadow-2xl">
              <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
              <p className="text-sm font-semibold text-white">Rendering High-DPI Pages with PDF.js...</p>
              <span className="text-xs text-slate-400">Loading full curriculum textbook</span>
            </div>
          )}

          {error && (
            <div className="flex max-w-md flex-col items-center rounded-3xl border border-red-500/20 bg-red-950/60 p-8 text-center text-white backdrop-blur-2xl shadow-2xl">
              <AlertCircle className="mb-3 h-10 w-10 text-red-400" />
              <h3 className="mb-1 text-base font-bold">Unable to Display PDF Stream</h3>
              <p className="mb-4 text-xs text-red-200 leading-relaxed">{error}</p>
              <a
                href={pdfUrl}
                download={`${title}.pdf`}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg transition hover:bg-red-500 hover:scale-105 active:scale-95"
              >
                Download PDF Directly
              </a>
            </div>
          )}

          <div
            className={`transition-all duration-300 ${isLoading || error ? "hidden" : "block"}`}
            style={{
              filter: getThemeCanvasFilter(),
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0,0,0,0.5)",
            }}
          >
            <canvas ref={canvasRef} className="rounded-xl bg-white shadow-2xl" />
          </div>
        </main>

        {/* Keyboard Shortcuts Modal */}
        <AnimatePresence>
          {showShortcuts && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-16 right-6 z-50 w-72 rounded-2xl border border-white/10 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur-2xl text-xs space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-bold text-sm text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Keyboard Shortcuts
                </span>
                <button onClick={() => setShowShortcuts(false)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Next / Prev Page</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-purple-300">→ / ← or J / K</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Zoom In / Out</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-purple-300">+ / -</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Fit to Width</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-purple-300">0</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Cycle Reading Theme</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-purple-300">T</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Toggle Fullscreen</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-purple-300">F</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Close Reader</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-purple-300">Esc</kbd>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
