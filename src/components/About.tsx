import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DownloadCloud, Sparkles, BookCheck, Cpu, Sliders } from "lucide-react";
import { Badge } from "@/components/ui/badge";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Interactive Slider State for Cell 2 (OCR Watermark Scrubber: 0 = fully watermarked, 100 = 100% clean)
  const [scrubberValue, setScrubberValue] = useState<number>(100);

  // Interactive State for Cell 3 (AI Vision Prompt)
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const aiPrompts = [
    {
      q: "Explain prime factor tree for 32760 from current page.",
      a: "32760 = 2³ × 3² × 5 × 7 × 13. Unique prime decomposition verified via Fundamental Theorem of Arithmetic.",
      grade: "Class 10 Math",
    },
    {
      q: "Calculate drift velocity from electric field vector E = 250 V/m.",
      a: "v_d = (e · E · τ) / m_e. Evaluates to 4.38 × 10⁻⁴ m/s in standard copper conductor with relaxation time τ = 2.5×10⁻¹⁴ s.",
      grade: "Class 12 Physics",
    },
    {
      q: "Identify stomatal opening mechanism in leaf epidermis.",
      a: "Guard cells swell via potassium (K⁺) ion influx and osmotic water uptake, causing stomatal pore dilation.",
      grade: "Class 10 Science",
    },
  ];

  // Calculate dynamic watermark opacity using gsap.utils.mapRange & clamp
  const watermarkOpacity = gsap.utils.pipe(
    (val: number) => gsap.utils.clamp(0, 100, val),
    (val: number) => gsap.utils.mapRange(0, 100, 0.45, 0)(val)
  )(scrubberValue);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Header reveal
        gsap.from(".about-header-item", {
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            once: true,
          },
          y: 16,
          autoAlpha: 0,
          duration: 0.35,
          stagger: 0.05,
          ease: "power3.out",
          immediateRender: false,
        });

        // Bento Cards staggered entrance
        gsap.from(".gsap-bento-card", {
          scrollTrigger: {
            trigger: ".gsap-bento-grid",
            start: "top 80%",
            once: true,
          },
          y: 20,
          autoAlpha: 0,
          duration: 0.35,
          stagger: 0.06,
          ease: "power3.out",
          immediateRender: false,
        });

        // QuickTo 3D tilt physics & spotlight coordination
        const cards = gsap.utils.toArray<HTMLElement>(".gsap-bento-card", containerRef.current);
        cards.forEach((card) => {
          const setRotX = gsap.quickTo(card, "rotationX", { duration: 0.35, ease: "power3.out" });
          const setRotY = gsap.quickTo(card, "rotationY", { duration: 0.35, ease: "power3.out" });

          const onMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Track cursor for spotlight illumination
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);

            const rotY = gsap.utils.mapRange(0, rect.width, -2.5, 2.5)(x);
            const rotX = gsap.utils.mapRange(0, rect.height, 2.5, -2.5)(y);
            setRotX(rotX);
            setRotY(rotY);
          };

          const onLeave = () => {
            setRotX(0);
            setRotY(0);
          };

          card.addEventListener("mousemove", onMove);
          card.addEventListener("mouseleave", onLeave);
        });
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      id="about"
      ref={containerRef}
      className="py-14 sm:py-24 bg-background relative [perspective:1200px]"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Section Header */}
        <div className="max-w-3xl mb-8 sm:mb-16">
          <div className="about-header-item text-[11px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 will-change-transform">
            SYSTEM ARCHITECTURE
          </div>
          <h2 className="about-header-item text-2xl sm:text-4xl font-bold tracking-tight text-foreground mb-3 sm:mb-4 will-change-transform">
            An end-to-end curriculum pipeline.
          </h2>
          <p className="about-header-item text-xs sm:text-base text-muted-foreground leading-relaxed max-w-[50ch] will-change-transform">
            EduScrapeApp transforms raw, fragmented education archives into clean, structured digital textbooks through automated crawling, watermark stripping, and dual cloud/hardware delivery.
          </p>
        </div>

        {/* Bento Grid (Asymmetric 12-column layout) */}
        <div className="gsap-bento-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* Bento Cell 1: Automated Scraping & Catalog Builder (7 cols) */}
          <div className="gsap-bento-card spotlight-card md:col-span-2 lg:col-span-7 p-4 sm:p-8 rounded-md border border-border bg-card flex flex-col justify-between transition-colors hover:border-muted-foreground will-change-transform [transform-style:preserve-3d]">
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  INGESTION ENGINE
                </span>
                <Badge variant="blue">
                  PYTHON AUTOMATION
                </Badge>
              </div>

              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground mb-2 sm:mb-3 flex items-center gap-2">
                <DownloadCloud className="w-5 h-5 text-foreground shrink-0" />
                <span>Recursive Catalog Discovery &amp; Taxonomy Sync</span>
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-6 max-w-[48ch]">
                Recursively scans digital education repositories, cataloging Class 1 through Class 12 materials into standardized JSON taxonomies with grade, subject, and chapter hierarchies.
              </p>

              {/* Ingestion Stream Mockup */}
              <pre className="p-3 sm:p-4 rounded-md bg-secondary/50 font-mono text-[11px] sm:text-xs space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 whitespace-pre-wrap overflow-x-auto">
                <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center justify-between font-mono">
                  <span>Scraper Ingestion Stream</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>
                <div className="space-y-1 text-muted-foreground text-[11px] sm:text-xs">
                  <div className="text-foreground font-medium">✓ [HTTP 200] Fetching NCERT Class 10 Math PDF</div>
                  <div>✓ Parsing Table of Contents: 14 chapters extracted</div>
                  <div>✓ Uploading sanitized payload to Supabase Storage</div>
                  <div className="text-[var(--pastel-green-text)] font-semibold">→ Sync Status: Complete (14.2 MB processed)</div>
                </div>
              </pre>
            </div>

            <div className="pt-3 sm:pt-4 border-t border-border flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground font-mono relative z-10">
              <span>Throughput: ~250 pgs/min</span>
              <span>Taxonomy: JSON Schema v2.1</span>
            </div>
          </div>

          {/* Bento Cell 2: Interactive OCR Sanitizer & Watermark Removal Scrubber (5 cols) */}
          <div className="gsap-bento-card spotlight-card md:col-span-1 lg:col-span-5 p-4 sm:p-8 rounded-md border border-border bg-card flex flex-col justify-between transition-colors hover:border-muted-foreground will-change-transform [transform-style:preserve-3d]">
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  PRE-PROCESSING
                </span>
                <Badge variant="green">
                  OCR SANITIZER
                </Badge>
              </div>

              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground mb-2 sm:mb-3 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-foreground shrink-0" />
                <span>Watermark Sanitization</span>
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3 sm:mb-4 max-w-[48ch]">
                Strips repository stamps, low-contrast background watermarks, and scan artifacts to maximize readability on low-cost displays.
              </p>

              {/* Touch-Optimized Scrubber Simulator */}
              <div className="space-y-2.5 sm:space-y-3 mb-3 sm:mb-4 font-mono">
                <div className="flex items-center justify-between text-[11px] sm:text-xs">
                  <span className="text-muted-foreground">Sanitization Level:</span>
                  <span className="font-semibold text-foreground bg-secondary px-2 py-0.5 rounded-sm border border-border">
                    {scrubberValue}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scrubberValue}
                  onChange={(e) => setScrubberValue(Number(e.target.value))}
                  className="w-full mobile-slider touch-manipulation"
                  aria-label="Sanitization Scrubber Level"
                />

                {/* Quick Touch Presets for Mobile Users */}
                <div className="flex items-center justify-between gap-1.5 text-[10px] sm:text-xs text-muted-foreground font-mono">
                  <button
                    type="button"
                    onClick={() => setScrubberValue(0)}
                    className={`px-2 py-1 rounded-sm border border-border touch-manipulation transition-colors ${scrubberValue === 0 ? "bg-foreground text-background" : "bg-secondary hover:text-foreground"}`}
                  >
                    0% Raw
                  </button>
                  <button
                    type="button"
                    onClick={() => setScrubberValue(50)}
                    className={`px-2 py-1 rounded-sm border border-border touch-manipulation transition-colors ${scrubberValue === 50 ? "bg-foreground text-background" : "bg-secondary hover:text-foreground"}`}
                  >
                    50% Filtered
                  </button>
                  <button
                    type="button"
                    onClick={() => setScrubberValue(100)}
                    className={`px-2 py-1 rounded-sm border border-border touch-manipulation transition-colors ${scrubberValue === 100 ? "bg-foreground text-background" : "bg-secondary hover:text-foreground"}`}
                  >
                    100% Clean
                  </button>
                </div>

                {/* Simulated Document Preview with dynamic watermark */}
                <div className="relative p-3 rounded-md bg-secondary/40 select-none min-h-[85px] flex flex-col justify-center overflow-hidden">
                  <span
                    className="absolute inset-0 flex items-center justify-center font-bold text-destructive uppercase tracking-widest text-xs sm:text-sm transform -rotate-12 pointer-events-none transition-opacity"
                    style={{ opacity: watermarkOpacity }}
                  >
                    STATE REPOSITORY WATERMARK
                  </span>

                  <div className="relative z-10 text-[11px] sm:text-xs text-foreground space-y-1">
                    <p className="font-semibold">Theorem 1.2 (Fundamental Arithmetic):</p>
                    <p className="text-muted-foreground text-[10px] sm:text-xs leading-relaxed max-w-[45ch]">
                      Every composite number can be uniquely factored into primes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 sm:pt-4 border-t border-border flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground font-mono relative z-10">
              <span>Artifact Rate: 0.00%</span>
              <span className="text-[var(--pastel-green-text)] font-semibold">OpenCV CLAHE</span>
            </div>
          </div>

          {/* Bento Cell 3: Interactive Gemini 2.0 Flash Vision Assistant (5 cols) */}
          <div className="gsap-bento-card spotlight-card md:col-span-1 lg:col-span-5 p-4 sm:p-8 rounded-md border border-border bg-card flex flex-col justify-between transition-colors hover:border-muted-foreground will-change-transform [transform-style:preserve-3d]">
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  AI ASSISTANT
                </span>
                <Badge variant="amber">
                  GEMINI 2.0 FLASH
                </Badge>
              </div>

              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground mb-2 sm:mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-foreground shrink-0" />
                <span>Multimodal Concept Explainer</span>
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3 sm:mb-4 max-w-[48ch]">
                Extracts mathematical notation, chemical reactions, and biology diagrams directly from textbook page coordinates.
              </p>

              {/* Mobile-Friendly AI Prompt Selector */}
              <div className="space-y-2.5 sm:space-y-3 mb-3 sm:mb-4">
                <div role="tablist" aria-label="AI prompt presets" className="flex items-center gap-1.5 overflow-x-auto text-[11px] sm:text-xs font-mono pb-1 mobile-scroll-row">
                  {aiPrompts.map((item, idx) => (
                    <button
                      key={idx}
                      role="tab"
                      aria-selected={activePromptIndex === idx}
                      onClick={() => setActivePromptIndex(idx)}
                      className={`px-2.5 py-1.5 rounded-sm transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground touch-manipulation active:scale-[0.97] ${activePromptIndex === idx
                          ? "bg-secondary text-foreground font-semibold border border-border"
                          : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {item.grade}
                    </button>
                  ))}
                </div>

                <blockquote className="p-3 sm:p-3.5 rounded-md bg-secondary/50 font-mono text-[11px] sm:text-xs space-y-2">
                  <div className="text-muted-foreground flex items-start gap-1.5">
                    <span className="text-foreground font-semibold shrink-0">Q:</span>
                    <span className="leading-snug">{aiPrompts[activePromptIndex].q}</span>
                  </div>
                  <div className="text-foreground pt-1.5 border-t border-border/60 leading-relaxed">
                    <span className="font-semibold text-foreground">Gemini:</span>{" "}
                    {aiPrompts[activePromptIndex].a}
                  </div>
                </blockquote>
              </div>
            </div>

            <div className="pt-3 sm:pt-4 border-t border-border flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground font-mono relative z-10">
              <span>Token Latency: ~180ms</span>
              <span>gemini-2.0-flash</span>
            </div>
          </div>

          {/* Bento Cell 4: Dual Delivery Architecture (7 cols) */}
          <div className="gsap-bento-card spotlight-card md:col-span-2 lg:col-span-7 p-4 sm:p-8 rounded-md border border-border bg-card flex flex-col justify-between transition-colors hover:border-muted-foreground will-change-transform [transform-style:preserve-3d]">
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  HYBRID DISTRIBUTION
                </span>
                <Badge variant="mono">
                  CLOUD + HARDWARE
                </Badge>
              </div>

              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground mb-2 sm:mb-3 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-foreground shrink-0" />
                <span>Dual Delivery: Web Portal &amp; Embedded ESP32</span>
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-6 max-w-[48ch]">
                Students access reading material either online via our high-speed React web portal or completely offline through dedicated low-power ESP32 physical reading units.
              </p>

              {/* Dual System Comparison */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-4 sm:mb-6 list-none p-0 m-0">
                <li className="p-3 sm:p-4 rounded-md bg-secondary/50">
                  <div className="font-semibold text-foreground flex items-center justify-between mb-1 text-[11px] sm:text-xs">
                    <span>Web Platform (Online)</span>
                    <Badge variant="blue">
                      ONLINE
                    </Badge>
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground font-sans leading-relaxed">
                    React 19 + Supabase Storage + PDF.js renderer with instant chapter navigation.
                  </p>
                </li>

                <li className="p-3 sm:p-4 rounded-md bg-secondary/50">
                  <div className="font-semibold text-foreground flex items-center justify-between mb-1 text-[11px] sm:text-xs">
                    <span>ESP32 Device (Offline)</span>
                    <Badge variant="amber">
                      OFFLINE
                    </Badge>
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground font-sans leading-relaxed">
                    Dual-core MCU with MicroSD FAT32 interface &amp; hardware D-pad page controls.
                  </p>
                </li>
              </ul>
            </div>

            <div className="pt-3 sm:pt-4 border-t border-border flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground font-mono relative z-10">
              <span className="flex items-center gap-1.5">
                <BookCheck className="w-3.5 h-3.5 text-foreground shrink-0" />
                Sync: Unified Schema
              </span>
              <span>100% Autonomous</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
