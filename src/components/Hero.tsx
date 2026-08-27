import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ArrowRight, Terminal, BookOpen, CheckCircle2, ShieldCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

interface PreviewCurriculum {
  id: string;
  grade: string;
  subject: string;
  chapter: string;
  pages: number;
  gradeScore: string;
  formula: string;
  snippet: string;
  badgeText: string;
}

const previewData: PreviewCurriculum[] = [
  {
    id: "class-10-math",
    grade: "Class 10",
    subject: "Mathematics",
    chapter: "01 · Real Numbers",
    pages: 22,
    gradeScore: "8.4 (Optimal)",
    formula: "x = p₁^{k₁} · p₂^{k₂} · · · p_n^{k_n}",
    snippet: "Fundamental Theorem of Arithmetic: Every composite number can be uniquely factorized into primes.",
    badgeText: "NCERT 2026",
  },
  {
    id: "class-10-sci",
    grade: "Class 10",
    subject: "Science",
    chapter: "06 · Life Processes",
    pages: 34,
    gradeScore: "8.1 (Optimal)",
    formula: "6CO₂ + 12H₂O ⟶ C₆H₁₂O₆ + 6O₂ + 6H₂O",
    snippet: "Photosynthesis: Autotrophic nutrition converts inorganic CO₂ and water into stored carbohydrates using chlorophyll.",
    badgeText: "LAB MANUAL",
  },
  {
    id: "class-12-phy",
    grade: "Class 12",
    subject: "Physics",
    chapter: "03 · Current Electricity",
    pages: 42,
    gradeScore: "11.8 (Advanced)",
    formula: "j = σ E  (Ohm's Law in vector form)",
    snippet: "Drift velocity & relaxation time: Free electron conduction in metallic lattices under electric potential gradients.",
    badgeText: "BOARD SPEC",
  },
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const primaryBtnRef = useRef<HTMLButtonElement>(null);
  const [selectedCurriculum, setSelectedCurriculum] = useState<PreviewCurriculum>(previewData[0]);
  const previewCardRef = useRef<HTMLDivElement>(null);

  const stats = [
    { label: "Curated Textbooks", value: "10,000+", detail: "Class 1–12 Catalog" },
    { label: "Watermark Artifacts", value: "0.0%", detail: "OpenCV CLAHE Engine" },
    { label: "Embedded Access", value: "<12ms", detail: "ESP32 SPI Latency" },
    { label: "Ingestion Speed", value: "250 p/m", detail: "Automated Pipeline" },
  ];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Snappy, high-craft glide entrance timeline
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from(".hero-status", {
          y: -10,
          autoAlpha: 0,
          duration: 0.25,
        })
          .from(
            ".hero-word",
            {
              y: 20,
              autoAlpha: 0,
              duration: 0.3,
              stagger: 0.02,
            },
            "-=0.15"
          )
          .from(
            ".hero-word-serif",
            {
              y: 20,
              autoAlpha: 0,
              duration: 0.3,
              stagger: 0.02,
            },
            "-=0.2"
          )
          .from(
            ".hero-subtext",
            {
              y: 12,
              autoAlpha: 0,
              duration: 0.25,
            },
            "-=0.2"
          )
          .from(
            ".hero-actions > *",
            {
              y: 10,
              autoAlpha: 0,
              duration: 0.25,
              stagger: 0.05,
            },
            "-=0.2"
          )
          .from(
            ".hero-guarantees > *",
            {
              y: 8,
              autoAlpha: 0,
              duration: 0.2,
              stagger: 0.04,
            },
            "-=0.15"
          )
          .from(
            ".hero-window",
            {
              scale: 0.98,
              y: 16,
              autoAlpha: 0,
              duration: 0.35,
            },
            "-=0.25"
          )
          .from(
            ".hero-stat-card",
            {
              y: 12,
              autoAlpha: 0,
              duration: 0.25,
              stagger: 0.04,
            },
            "-=0.2"
          );

        // High-performance quickTo cursor tilt & spotlight coordinates on faux-window
        if (windowRef.current) {
          const el = windowRef.current;
          const setRotX = gsap.quickTo(el, "rotationX", { duration: 0.4, ease: "power3.out" });
          const setRotY = gsap.quickTo(el, "rotationY", { duration: 0.4, ease: "power3.out" });

          const handleMouseMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Update spotlight variables for illumination
            el.style.setProperty("--mouse-x", `${x}px`);
            el.style.setProperty("--mouse-y", `${y}px`);

            // Map mouse coordinates to subtle [-3.5deg, 3.5deg] range
            const rotY = gsap.utils.mapRange(0, rect.width, -3.5, 3.5)(x);
            const rotX = gsap.utils.mapRange(0, rect.height, 3.5, -3.5)(y);

            setRotX(rotX);
            setRotY(rotY);
          };

          const handleMouseLeave = () => {
            setRotX(0);
            setRotY(0);
          };

          el.addEventListener("mousemove", handleMouseMove);
          el.addEventListener("mouseleave", handleMouseLeave);
        }

        // Magnetic hover physics on primary CTA button
        const btn = primaryBtnRef.current;
        if (!btn) return;

        const setX = gsap.quickTo(btn, "x", { duration: 0.3, ease: "power3.out" });
        const setY = gsap.quickTo(btn, "y", { duration: 0.3, ease: "power3.out" });

        const onMouseMove = (e: MouseEvent) => {
          const rect = btn.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const deltaX = e.clientX - centerX;
          const deltaY = e.clientY - centerY;
          const distance = Math.hypot(deltaX, deltaY);

          if (distance < 60) {
            setX(deltaX * 0.25);
            setY(deltaY * 0.25);
          } else {
            setX(0);
            setY(0);
          }
        };

        const onMouseLeave = () => {
          setX(0);
          setY(0);
        };

        window.addEventListener("mousemove", onMouseMove, { passive: true });
        btn.addEventListener("mouseleave", onMouseLeave);

        return () => {
          window.removeEventListener("mousemove", onMouseMove);
          btn.removeEventListener("mouseleave", onMouseLeave);
        };
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  const handleSelectCurriculum = (item: PreviewCurriculum) => {
    if (item.id === selectedCurriculum.id) return;
    if (previewCardRef.current) {
      gsap.to(previewCardRef.current, {
        autoAlpha: 0.1,
        y: 6,
        duration: 0.15,
        onComplete: () => {
          setSelectedCurriculum(item);
          gsap.to(previewCardRef.current, {
            autoAlpha: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        },
      });
    } else {
      setSelectedCurriculum(item);
    }
  };

  const scrollToAbout = () => {
    gsap.to(window, {
      duration: 0.8,
      scrollTo: { y: "#about", offsetY: 56 },
      ease: "power2.inOut",
    });
  };

  const titleWords = ["Structured", "K–12", "textbooks."];
  const serifWords = ["Curated,", "graded,", "and", "delivered", "anywhere."];

  return (
    <section
      id="home"
      ref={containerRef}
      className="pt-28 pb-20 bg-background relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Status Eyebrow */}
            <div className="hero-status mb-4 inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-foreground/20 bg-foreground/[0.04] text-xs font-mono text-foreground/80 will-change-transform">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Curriculum Pipeline · Class 1–12</span>
            </div>

            <h1 className="hero-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.08] mb-4">
              <span className="hero-words block">
                {titleWords.map((word, idx) => (
                  <span key={idx} className="hero-word inline-block mr-[0.25em]">
                    {word}
                  </span>
                ))}
              </span>
              <span className="hero-serif-words block font-serif italic font-normal text-muted-foreground">
                {serifWords.map((word, idx) => (
                  <span key={idx} className="hero-word-serif inline-block mr-[0.25em]">
                    {word}
                  </span>
                ))}
              </span>
            </h1>

            <p className="hero-subtext text-base text-muted-foreground max-w-[48ch] leading-relaxed mb-8">
              Autonomous web scraping, OpenCV CLAHE watermark sanitization, and dual delivery architecture across high-DPI web reader and low-cost offline ESP32 microcontrollers.
            </p>

            <div className="hero-actions flex flex-wrap items-center gap-3 w-full sm:w-auto mb-8">
              <Button
                ref={primaryBtnRef}
                size="lg"
                onClick={() => {
                  window.history.pushState({}, "", "#login");
                  window.dispatchEvent(new Event("hashchange"));
                }}
                className="h-11 px-6 py-2.5 text-sm font-medium gap-2 cursor-pointer shadow-xs hover:shadow-sm"
              >
                <span>Launch Digital Library</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={scrollToAbout}
                className="h-11 px-6 py-2.5 text-sm font-medium gap-2 cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-muted-foreground" />
                <span>Pipeline Architecture</span>
              </Button>
            </div>

            <div className="hero-guarantees flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-foreground" />
                100% Free &amp; Open Source
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-foreground" />
                Zero Analytics / Privacy-First
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-foreground" />
                Class 1–12 Complete Syllabus
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Faux-Browser Window Mockup (5 cols) */}
          <div className="hero-window lg:col-span-5 [perspective:1000px]">
            <div
              ref={windowRef}
              className="window-chrome spotlight-card [transform-style:preserve-3d] will-change-transform transition-shadow duration-300 hover:shadow-lg"
            >
              {/* Window Header */}
              <div className="window-header relative z-10 border-b border-border">
                <div className="window-dots">
                  <div className="window-dot" />
                  <div className="window-dot" />
                  <div className="window-dot" />
                </div>
                <span className="text-muted-foreground text-xs truncate px-2 font-mono">
                  eduscrape://{selectedCurriculum.id}
                </span>
                <Badge variant="green">
                  LIVE
                </Badge>
              </div>

              {/* Interactive Curriculum Selector Pills (Semantic nav safe tag) */}
              <nav role="tablist" aria-label="Curriculum tabs" className="p-2.5 border-b border-border flex items-center gap-1.5 overflow-x-auto text-xs font-mono relative z-10">
                {previewData.map((item) => (
                  <button
                    key={item.id}
                    role="tab"
                    aria-selected={selectedCurriculum.id === item.id}
                    onClick={() => handleSelectCurriculum(item)}
                    className={`px-3 py-1.5 rounded-sm transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground ${selectedCurriculum.id === item.id
                        ? "bg-card text-foreground font-semibold border border-border shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {item.grade} {item.subject}
                  </button>
                ))}
              </nav>

              {/* Dynamic Curriculum Preview Body (Semantic pre safe tag) */}
              <div ref={previewCardRef} className="p-4 space-y-3 font-mono text-xs relative z-10">
                {/* Active Book Row */}
                <div className="p-3.5 rounded-md bg-secondary/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                      <BookOpen className="w-3.5 h-3.5 text-foreground" />
                      {selectedCurriculum.grade} · {selectedCurriculum.subject}
                    </span>
                    <Badge variant="blue">
                      {selectedCurriculum.badgeText}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Chapter:</span>
                      <span className="text-foreground">
                        {selectedCurriculum.chapter} ({selectedCurriculum.pages} pgs)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Readability Index:</span>
                      <span className="text-foreground">{selectedCurriculum.gradeScore}</span>
                    </div>
                  </div>
                </div>

                {/* Concept Formula Block (Semantic pre safe tag) */}
                <pre className="p-3.5 rounded-md bg-secondary/30 font-mono text-xs space-y-1.5 whitespace-pre-wrap">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>Parsed Concept Formula</span>
                    <span className="text-xs font-mono text-[var(--pastel-green-text)] font-semibold">OCR Verified</span>
                  </div>
                  <div className="font-semibold text-foreground font-mono text-xs">
                    {selectedCurriculum.formula}
                  </div>
                  <p className="text-xs text-muted-foreground font-sans leading-relaxed pt-0.5">
                    {selectedCurriculum.snippet}
                  </p>
                </pre>

                {/* Micro Command Bar */}
                <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Clean PDF Ready
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-foreground" />
                    Supabase Synchronized
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Stats Band with Semantic list safe tag */}
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-border list-none p-0 m-0">
          {stats.map((item, idx) => (
            <li
              key={idx}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
              }}
              className="hero-stat-card spotlight-card p-4 rounded-md border border-border bg-card will-change-transform transition-colors hover:border-muted-foreground"
            >
              <div className="text-xs font-mono uppercase text-muted-foreground tracking-wide mb-1 relative z-10">
                {item.label}
              </div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono relative z-10">
                {item.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1 relative z-10">
                {item.detail}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
