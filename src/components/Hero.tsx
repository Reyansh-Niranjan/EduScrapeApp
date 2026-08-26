import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ArrowRight, Terminal, BookOpen, Check, ShieldCheck, Sparkles, FileText } from "lucide-react";
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
    { label: "Curated Textbooks", value: "10,000+", detail: "NCERT & State Boards" },
    { label: "Grade Range", value: "Class 1–12", detail: "Complete K–12 Schema" },
    { label: "OCR Sanitization", value: "100% Clean", detail: "Zero Watermarks" },
    { label: "ESP32 Offline Read", value: "<12ms", detail: "FAT32 Storage Access" },
  ];

  useGSAP(
    () => {
      // Cinematic Blur-to-Focus Glide Timeline (Inspired by walaszczyk.studio & subscrr.app)
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.from(".hero-status", {
        y: -14,
        filter: "blur(8px)",
        autoAlpha: 0,
        duration: 0.5,
      })
        .from(
          ".hero-word",
          {
            y: 40,
            filter: "blur(14px)",
            autoAlpha: 0,
            duration: 0.85,
            stagger: 0.045,
            ease: "power4.out",
          },
          "-=0.25"
        )
        .from(
          ".hero-word-serif",
          {
            y: 40,
            filter: "blur(14px)",
            autoAlpha: 0,
            duration: 0.9,
            stagger: 0.04,
            ease: "power4.out",
          },
          "-=0.6"
        )
        .from(
          ".hero-subtext",
          {
            y: 20,
            filter: "blur(10px)",
            autoAlpha: 0,
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.5"
        )
        .from(
          ".hero-actions > *",
          {
            y: 16,
            autoAlpha: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power3.out",
          },
          "-=0.4"
        )
        .from(
          ".hero-guarantees > *",
          {
            y: 10,
            autoAlpha: 0,
            duration: 0.4,
            stagger: 0.08,
          },
          "-=0.3"
        )
        .from(
          ".hero-window",
          {
            scale: 0.95,
            y: 35,
            filter: "blur(16px)",
            autoAlpha: 0,
            duration: 0.95,
            ease: "power3.out",
          },
          "-=0.7"
        )
        .from(
          ".hero-stat-card",
          {
            y: 28,
            filter: "blur(10px)",
            autoAlpha: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
          },
          "-=0.5"
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

        return () => {
          el.removeEventListener("mousemove", handleMouseMove);
          el.removeEventListener("mouseleave", handleMouseLeave);
        };
      }
    },
    { scope: containerRef }
  );

  // Magnetic button physics (Inspired by walaszczyk.studio)
  useGSAP(
    () => {
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
    },
    { scope: containerRef }
  );

  const handleSelectCurriculum = (item: PreviewCurriculum) => {
    if (item.id === selectedCurriculum.id) return;
    if (previewCardRef.current) {
      gsap.to(previewCardRef.current, {
        autoAlpha: 0.1,
        y: 6,
        filter: "blur(6px)",
        duration: 0.15,
        onComplete: () => {
          setSelectedCurriculum(item);
          gsap.to(previewCardRef.current, {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
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
      className="pt-28 pb-20 border-b border-border bg-background/80 backdrop-blur-[2px] bg-minimal-grid relative overflow-hidden"
    >
      <div className="ambient-glow-top" />

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Status Eyebrow */}
            <div className="hero-status mb-4 inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-secondary text-[11px] font-mono text-muted-foreground will-change-transform">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>AUTOMATED CURRICULUM PIPELINE · v2.4</span>
            </div>

            {/* Headline with Cinematic Word-by-Word Split Reveal */}
            <h1 className="hero-headline text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.08] mb-5">
              <span className="block overflow-hidden pb-1">
                {titleWords.map((word, idx) => (
                  <span key={idx} className="hero-word inline-block mr-[0.25em] will-change-transform">
                    {word}
                  </span>
                ))}
              </span>
              <span className="block font-serif-italic font-normal text-muted-foreground text-3xl sm:text-5xl lg:text-6xl overflow-hidden pt-1">
                {serifWords.map((word, idx) => (
                  <span key={idx} className="hero-word-serif inline-block mr-[0.25em] will-change-transform">
                    {word}
                  </span>
                ))}
              </span>
            </h1>

            {/* Subtext */}
            <p className="hero-subtext text-base text-muted-foreground max-w-[52ch] leading-relaxed mb-8 will-change-transform">
              EduScrapeApp automates catalog discovery, watermark removal, and readability scoring for Class 1–12. Content streams directly to a fast in-browser reader and an offline ESP32 hardware device.
            </p>

            {/* Actions with Magnetic Physics */}
            <div className="hero-actions flex flex-wrap items-center gap-3 w-full sm:w-auto mb-8 will-change-transform">
              <Button
                ref={primaryBtnRef}
                size="lg"
                onClick={() => {
                  window.location.hash = "#login";
                }}
                className="gap-2 font-medium will-change-transform shadow-sm hover:shadow-md transition-shadow"
              >
                Access Digital Library
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={scrollToAbout}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <Terminal className="w-4 h-4" />
                Pipeline Architecture
              </Button>
            </div>

            {/* Guarantees */}
            <div className="hero-guarantees flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-mono will-change-transform">
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-foreground" />
                Zero Watermarks
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-foreground" />
                In-Browser PDF Reader
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-foreground" />
                ESP32 Hardware Sync
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Spotlight Faux-OS Window (5 cols) */}
          <div className="hero-window lg:col-span-5 [perspective:1000px]">
            <div
              ref={windowRef}
              className="window-chrome spotlight-card [transform-style:preserve-3d] will-change-transform transition-shadow duration-300 hover:shadow-xl"
            >
              {/* Window Header */}
              <div className="window-header relative z-10">
                <div className="window-dots">
                  <div className="window-dot" />
                  <div className="window-dot" />
                  <div className="window-dot" />
                </div>
                <span className="text-muted-foreground text-[11px] truncate px-2">
                  eduscrape://{selectedCurriculum.id}
                </span>
                <Badge variant="green" className="text-[10px] px-1.5 py-0.5 font-mono">
                  LIVE
                </Badge>
              </div>

              {/* Interactive Curriculum Selector Pills */}
              <div className="p-3 border-b border-border bg-secondary/50 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono relative z-10">
                {previewData.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectCurriculum(item)}
                    className={`px-2.5 py-1 rounded transition-all whitespace-nowrap cursor-pointer ${selectedCurriculum.id === item.id
                        ? "bg-card text-foreground font-semibold border border-border shadow-xs scale-102"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {item.grade} {item.subject}
                  </button>
                ))}
              </div>

              {/* Dynamic Curriculum Preview Body */}
              <div ref={previewCardRef} className="p-4 space-y-3 font-mono text-xs will-change-transform relative z-10">
                {/* Active Book Row */}
                <div className="p-3 rounded-md border border-border bg-card/90 backdrop-blur-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                      <BookOpen className="w-3.5 h-3.5 text-foreground" />
                      {selectedCurriculum.grade} · {selectedCurriculum.subject}
                    </span>
                    <Badge variant="blue" className="text-[10px] px-1.5 py-0.5">
                      {selectedCurriculum.badgeText}
                    </Badge>
                  </div>

                  <div className="text-[11px] text-muted-foreground space-y-1">
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
                    <div className="flex justify-between">
                      <span>Artifact Removal:</span>
                      <span className="text-[var(--pastel-green-text)] font-semibold">100% Watermark Free</span>
                    </div>
                  </div>
                </div>

                {/* Live Formula / Snippet Box */}
                <div className="p-3 rounded-md border border-border bg-secondary/40 font-mono text-[11px] space-y-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>Parsed Concept Formula</span>
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  </div>
                  <div className="font-semibold text-foreground bg-card p-2 rounded border border-border">
                    {selectedCurriculum.formula}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-sans leading-relaxed pt-1">
                    {selectedCurriculum.snippet}
                  </p>
                </div>

                {/* Micro Command Bar */}
                <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Clean PDF Ready
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    Supabase Synchronized
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Stats Band with Spotlight Illumination */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-border">
          {stats.map((item, idx) => (
            <div
              key={idx}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
              }}
              className="hero-stat-card spotlight-card p-4 rounded-md border border-border bg-card will-change-transform transition-colors hover:border-muted-foreground"
            >
              <div className="text-[11px] font-mono uppercase text-muted-foreground tracking-wide mb-1 relative z-10">
                {item.label}
              </div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono relative z-10">
                {item.value}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 relative z-10">
                {item.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
