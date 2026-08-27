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
  Loader2,
  Sun,
  Moon,
  Eye,
  AlertCircle,
  Sparkles,
  HelpCircle,
  ArrowLeft,
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
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>("dark");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [pageInputValue, setPageInputValue] = useState<string>("1");
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mainViewportRef = useRef<HTMLElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Fit to Width Handler
  const handleFitToWidth = useCallback(async () => {
    if (!pdfDoc || !mainViewportRef.current) return;
    try {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1.0, rotation });
      const isMobile = window.innerWidth < 640;
      const padding = isMobile ? 12 : 48;
      const availableWidth = mainViewportRef.current.clientWidth - padding;
      if (availableWidth > 0 && viewport.width > 0) {
        const calculatedScale = Math.min(Math.max(availableWidth / viewport.width, 0.4), 3.0);
        setScale(parseFloat(calculatedScale.toFixed(2)));
      }
    } catch (e) {
      console.warn("Fit to width error:", e);
    }
  }, [pdfDoc, currentPage, rotation]);

  // Load PDF Document
  useEffect(() => {
    if (!isOpen || !pdfUrl) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setCurrentPage(1);
    setPageInputValue("1");
    setControlsVisible(true);

    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl,
      cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@legacy/cmaps/",
      cMapPacked: true,
    });

    loadingTask.promise
      .then(async (doc) => {
        if (!isMounted) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setIsLoading(false);

        // Auto calculate scale on document open
        try {
          const page = await doc.getPage(1);
          const viewport = page.getViewport({ scale: 1.0 });
          const isMobile = window.innerWidth < 640;
          const padding = isMobile ? 12 : 48;
          const availableWidth = (mainViewportRef.current?.clientWidth || window.innerWidth) - padding;
          if (availableWidth > 0 && viewport.width > 0) {
            const calculatedScale = Math.min(Math.max(availableWidth / viewport.width, 0.4), 3.0);
            setScale(parseFloat(calculatedScale.toFixed(2)));
          }
        } catch {
          // Fallback
        }
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

  // Window resize handler for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        handleFitToWidth();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleFitToWidth]);

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

  const handleZoomIn = () => setScale((prev) => Math.min(parseFloat((prev + 0.15).toFixed(2)), 3.0));
  const handleZoomOut = () => setScale((prev) => Math.max(parseFloat((prev - 0.15).toFixed(2)), 0.4));
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
        className="fixed inset-0 z-50 flex flex-col bg-background text-foreground select-none"
        ref={containerRef}
      >
        {/* Top Reading Progress Line */}
        <div className="h-1 w-full bg-secondary relative overflow-hidden z-40 safe-top">
          <motion.div
            className="h-full bg-foreground"
            initial={{ width: 0 }}
            animate={{ width: `${percentProgress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Top Header Control Bar (Can toggle on mobile for full immersion) */}
        <AnimatePresence>
          {controlsVisible && (
            <motion.header
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex h-13 sm:h-14 items-center justify-between border-b border-border bg-card/95 px-3 sm:px-4 text-foreground backdrop-blur-md z-30 shrink-0"
            >
              {/* Left Back & Title */}
              <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0">
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-secondary transition-colors cursor-pointer touch-manipulation active:scale-95 shrink-0"
                  title="Back (Esc)"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <div className="truncate min-w-0">
                  <h2 className="truncate text-xs sm:text-sm font-bold tracking-tight text-foreground" title={title}>
                    {title}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {(className || subject) && (
                      <span className="truncate text-[10px] sm:text-xs text-muted-foreground font-mono">
                        {className} {subject ? `• ${subject}` : ""}
                      </span>
                    )}
                    <span className="text-[10px] sm:text-xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.2 rounded-xs border border-border shrink-0">
                      {percentProgress}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Center Pagination Jump */}
              <div className="hidden md:flex items-center space-x-1.5 sm:space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1 || isLoading}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary active:scale-95 disabled:opacity-30 cursor-pointer"
                  title="Previous Page (← or J)"
                  aria-label="Previous Page"
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
                    className="h-7 w-12 rounded-sm border border-border bg-background text-center text-xs font-mono font-medium text-foreground transition focus:border-foreground focus:outline-none"
                  />
                  <span className="text-xs font-mono text-muted-foreground">/ {numPages || "--"}</span>
                </form>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= numPages || isLoading}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary active:scale-95 disabled:opacity-30 cursor-pointer"
                  title="Next Page (→ or K)"
                  aria-label="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Right Action Tools */}
              <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
                {/* Reading Theme Toggle */}
                <div className="flex items-center rounded-md border border-border bg-secondary p-0.5">
                  <button
                    onClick={() => setReadingTheme("light")}
                    className={`rounded-xs p-1.5 transition-colors touch-manipulation active:scale-95 ${
                      readingTheme === "light" ? "bg-foreground text-background shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Light Theme"
                    aria-label="Light Theme"
                  >
                    <Sun className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setReadingTheme("sepia")}
                    className={`rounded-xs p-1.5 transition-colors touch-manipulation active:scale-95 ${
                      readingTheme === "sepia" ? "bg-amber-700 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Sepia Mode"
                    aria-label="Sepia Mode"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setReadingTheme("dark")}
                    className={`rounded-xs p-1.5 transition-colors touch-manipulation active:scale-95 ${
                      readingTheme === "dark" ? "bg-foreground text-background shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Dark Mode"
                    aria-label="Dark Mode"
                  >
                    <Moon className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Desktop Zoom Controls */}
                <div className="hidden lg:flex items-center space-x-1 rounded-md border border-border bg-secondary p-0.5">
                  <button
                    onClick={handleZoomOut}
                    disabled={scale <= 0.4}
                    className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:text-foreground hover:bg-background disabled:opacity-30 cursor-pointer"
                    title="Zoom Out (-)"
                    aria-label="Zoom Out"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleFitToWidth}
                    className="px-2 py-1 text-xs font-mono font-medium text-foreground hover:opacity-80 transition cursor-pointer"
                    title="Fit Width (Press 0)"
                  >
                    {Math.round(scale * 100)}%
                  </button>
                  <button
                    onClick={handleZoomIn}
                    disabled={scale >= 3.0}
                    className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:text-foreground hover:bg-background disabled:opacity-30 cursor-pointer"
                    title="Zoom In (+)"
                    aria-label="Zoom In"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleRotate}
                    className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:text-foreground hover:bg-background cursor-pointer"
                    title="Rotate 90°"
                    aria-label="Rotate 90°"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Keyboard Shortcuts Dialog Toggle */}
                <button
                  onClick={() => setShowShortcuts((prev) => !prev)}
                  className="hidden sm:block rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary cursor-pointer"
                  title="Keyboard Shortcuts (?)"
                  aria-label="Keyboard Shortcuts"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>

                {/* Download */}
                <a
                  href={pdfUrl}
                  download={`${title}.pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary cursor-pointer touch-manipulation active:scale-95"
                  title="Download PDF"
                  aria-label="Download PDF"
                >
                  <Download className="h-4 w-4" />
                </a>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="hidden rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary sm:block cursor-pointer"
                  title="Fullscreen Toggle (F)"
                  aria-label="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        {/* PDF Document Canvas Viewport */}
        <main
          ref={mainViewportRef}
          onClick={() => setControlsVisible((v) => !v)}
          className={`relative flex flex-1 items-center justify-center overflow-auto p-1 sm:p-6 pb-24 transition-colors duration-300 ${getThemeBg()}`}
        >
          {isLoading && (
            <div className="flex flex-col items-center space-y-3 text-muted-foreground p-6 sm:p-8 rounded-md border border-border bg-card shadow-lg mx-4">
              <Loader2 className="h-7 w-7 animate-spin text-foreground" />
              <p className="text-xs sm:text-sm font-semibold text-foreground text-center">Rendering High-DPI PDF Pages...</p>
              <span className="text-[11px] text-muted-foreground font-mono">Loading NCERT textbook stream</span>
            </div>
          )}

          {error && (
            <div className="flex max-w-md flex-col items-center rounded-md border border-destructive/30 bg-[var(--pastel-red-bg)] text-[var(--pastel-red-text)] p-6 sm:p-8 text-center shadow-lg mx-4">
              <AlertCircle className="mb-2 h-7 w-7 text-destructive" />
              <h3 className="mb-1 text-sm sm:text-base font-bold text-foreground">Unable to Display PDF Stream</h3>
              <p className="mb-3 text-xs leading-relaxed">{error}</p>
              <a
                href={pdfUrl}
                download={`${title}.pdf`}
                className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-xs font-medium transition-opacity hover:opacity-90 active:scale-95"
              >
                Download PDF Directly
              </a>
            </div>
          )}

          <div
            className={`transition-all duration-300 ${isLoading || error ? "hidden" : "block"}`}
            style={{
              filter: getThemeCanvasFilter(),
              boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
            }}
          >
            <canvas ref={canvasRef} className="rounded-md bg-white max-w-full" />
          </div>
        </main>

        {/* Mobile Thumb Zone Floating Reading Dock (Bottom) */}
        <AnimatePresence>
          {controlsVisible && numPages > 0 && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="fixed bottom-3 left-3 right-3 z-40 bg-card/95 backdrop-blur-md border border-border rounded-xl p-2 flex items-center justify-between shadow-2xl safe-bottom max-w-md mx-auto"
            >
              {/* Prev Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevPage();
                }}
                disabled={currentPage <= 1 || isLoading}
                className="h-10 w-10 flex items-center justify-center rounded-lg border border-border bg-secondary text-foreground disabled:opacity-30 touch-manipulation active:scale-90 transition-transform"
                aria-label="Previous Page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Page Form & Quick Jump */}
              <form
                onSubmit={(e) => {
                  e.stopPropagation();
                  handlePageJump(e);
                }}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 font-mono text-xs"
              >
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={numPages}
                  value={pageInputValue}
                  onChange={(e) => setPageInputValue(e.target.value)}
                  onBlur={handlePageJump}
                  className="h-9 w-12 rounded-md border border-border bg-background text-center font-bold text-foreground text-xs focus:border-foreground focus:outline-none"
                />
                <span className="text-muted-foreground text-xs">/ {numPages}</span>
              </form>

              {/* Quick Zoom Tools */}
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleZoomOut}
                  className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary touch-manipulation active:scale-90"
                  title="Zoom Out"
                  aria-label="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  onClick={handleFitToWidth}
                  className="h-9 px-2 flex items-center justify-center rounded-md font-mono text-[11px] font-semibold text-foreground bg-secondary/80 border border-border touch-manipulation active:scale-90"
                  title="Fit Width"
                  aria-label="Fit Width"
                >
                  Fit
                </button>
                <button
                  onClick={handleZoomIn}
                  className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary touch-manipulation active:scale-90"
                  title="Zoom In"
                  aria-label="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>

              {/* Next Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextPage();
                }}
                disabled={currentPage >= numPages || isLoading}
                className="h-10 w-10 flex items-center justify-center rounded-lg border border-border bg-secondary text-foreground disabled:opacity-30 touch-manipulation active:scale-90 transition-transform"
                aria-label="Next Page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard Shortcuts Modal */}
        <AnimatePresence>
          {showShortcuts && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-16 right-6 z-50 w-72 rounded-md border border-border bg-card p-4 text-foreground shadow-lg text-xs space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Keyboard Shortcuts
                </span>
                <button onClick={() => setShowShortcuts(false)} aria-label="Close shortcuts" className="text-muted-foreground hover:text-foreground">
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Next / Prev Page</span>
                  <kbd className="px-2 py-1 text-xs rounded bg-secondary font-mono text-foreground">→ / ← or J / K</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Zoom In / Out</span>
                  <kbd className="px-2 py-1 text-xs rounded bg-secondary font-mono text-foreground">+ / -</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fit to Width</span>
                  <kbd className="px-2 py-1 text-xs rounded bg-secondary font-mono text-foreground">0</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cycle Theme</span>
                  <kbd className="px-2 py-1 text-xs rounded bg-secondary font-mono text-foreground">T</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Toggle Fullscreen</span>
                  <kbd className="px-2 py-1 text-xs rounded bg-secondary font-mono text-foreground">F</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Close Reader</span>
                  <kbd className="px-2 py-1 text-xs rounded bg-secondary font-mono text-foreground">Esc</kbd>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
