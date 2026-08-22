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

type ReadingTheme = "light" | "dark" | "sepia";

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
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>("light");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [pageInputValue, setPageInputValue] = useState<string>("1");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
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
        setError("Failed to load PDF. Please check your connection or download directly.");
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
      loadingTask.destroy();
    };
  }, [isOpen, pdfUrl]);

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

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
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
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        handleNextPage();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        handlePrevPage();
      } else if (e.key === "Escape" && !document.fullscreenElement) {
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentPage, numPages, onClose]);

  if (!isOpen) return null;

  const getThemeCanvasFilter = () => {
    switch (readingTheme) {
      case "dark":
        return "invert(0.9) hue-rotate(180deg) brightness(0.95) contrast(1.1)";
      case "sepia":
        return "sepia(0.35) brightness(0.95) contrast(0.95)";
      default:
        return "none";
    }
  };

  const getThemeBg = () => {
    switch (readingTheme) {
      case "dark":
        return "bg-zinc-950";
      case "sepia":
        return "bg-[#f4ecd8]";
      default:
        return "bg-slate-900";
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-md"
        ref={containerRef}
      >
        {/* Top Control Bar */}
        <header className="flex h-14 items-center justify-between border-b border-white/10 bg-slate-900/90 px-4 text-white shadow-lg backdrop-blur-xl">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/30 text-indigo-400">
              <FileText className="h-4 w-4" />
            </div>
            <div className="truncate">
              <h2 className="truncate text-sm font-semibold tracking-tight text-white md:text-base">
                {title}
              </h2>
              {(className || subject) && (
                <p className="truncate text-xs text-slate-400">
                  {className} {subject ? `• ${subject}` : ""}
                </p>
              )}
            </div>
          </div>

          {/* Center Pagination */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1 || isLoading}
              className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 disabled:opacity-40"
              title="Previous Page (Left Arrow)"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <form onSubmit={handlePageJump} className="flex items-center space-x-1.5">
              <input
                type="text"
                value={pageInputValue}
                onChange={(e) => setPageInputValue(e.target.value)}
                onBlur={handlePageJump}
                disabled={isLoading || numPages === 0}
                className="h-7 w-12 rounded-md border border-white/15 bg-white/5 text-center text-xs font-medium text-white transition focus:border-indigo-500 focus:outline-none"
              />
              <span className="text-xs text-slate-400">/ {numPages || "--"}</span>
            </form>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= numPages || isLoading}
              className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 disabled:opacity-40"
              title="Next Page (Right Arrow)"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Reading Theme Toggle */}
            <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
              <button
                onClick={() => setReadingTheme("light")}
                className={`rounded-md p-1.5 transition ${
                  readingTheme === "light" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
                title="Light Mode"
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setReadingTheme("sepia")}
                className={`rounded-md p-1.5 transition ${
                  readingTheme === "sepia" ? "bg-amber-700 text-white" : "text-slate-400 hover:text-white"
                }`}
                title="Sepia Eye Comfort"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setReadingTheme("dark")}
                className={`rounded-md p-1.5 transition ${
                  readingTheme === "dark" ? "bg-zinc-800 text-white" : "text-slate-400 hover:text-white"
                }`}
                title="Dark Mode Reading"
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="hidden items-center space-x-1 sm:flex">
              <button
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 disabled:opacity-40"
                title="Zoom Out (-)"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-xs text-slate-400 font-mono">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={scale >= 3.0}
                className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 disabled:opacity-40"
                title="Zoom In (+)"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={handleRotate}
                className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10"
                title="Rotate Page"
              >
                <RotateCw className="h-4 w-4" />
              </button>
            </div>

            {/* Download */}
            <a
              href={pdfUrl}
              download={`${title}.pdf`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
            </a>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="hidden rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white sm:block"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="rounded-lg bg-red-500/20 p-1.5 text-red-400 transition hover:bg-red-500/30 hover:text-red-300"
              title="Close Reader (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* PDF Document Canvas Viewport */}
        <main className={`relative flex flex-1 items-center justify-center overflow-auto p-4 transition-colors duration-300 ${getThemeBg()}`}>
          {isLoading && (
            <div className="flex flex-col items-center space-y-3 text-slate-300">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
              <p className="text-sm font-medium">Loading textbook with PDF.js...</p>
            </div>
          )}

          {error && (
            <div className="flex max-w-md flex-col items-center rounded-2xl border border-red-500/20 bg-red-950/40 p-6 text-center text-white backdrop-blur-xl">
              <AlertCircle className="mb-3 h-10 w-10 text-red-400" />
              <h3 className="mb-1 text-base font-semibold">Unable to Display PDF</h3>
              <p className="mb-4 text-xs text-red-200">{error}</p>
              <a
                href={pdfUrl}
                download={`${title}.pdf`}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-red-500"
              >
                Download Instead
              </a>
            </div>
          )}

          <div
            className={`transition-all duration-200 ${isLoading || error ? "hidden" : "block"}`}
            style={{
              filter: getThemeCanvasFilter(),
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
            }}
          >
            <canvas ref={canvasRef} className="rounded-lg bg-white shadow-2xl" />
          </div>
        </main>

        {/* Bottom Reading Progress Bar */}
        {numPages > 0 && (
          <div className="h-1 w-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${(currentPage / numPages) * 100}%` }}
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
