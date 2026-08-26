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
      // Header Blur-to-Focus reveal
      gsap.from(".about-header-item", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
        },
        y: 28,
        filter: "blur(12px)",
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power4.out",
      });

      // Bento Cards Blur-to-Focus staggered entrance (Inspired by walaszczyk.studio & subscrr.app)
      gsap.from(".gsap-bento-card", {
        scrollTrigger: {
          trigger: ".gsap-bento-grid",
          start: "top 80%",
        },
        y: 40,
        filter: "blur(14px)",
        autoAlpha: 0,
        duration: 0.9,
        stagger: gsap.utils.distribute({
          base: 0,
          amount: 0.28,
          from: "start",
          ease: "power2.out",
        }),
        ease: "power4.out",
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
    },
    { scope: containerRef }
  );

  return (
    <section
      id="about"
      ref={containerRef}
      className="py-24 border-b border-border bg-background/80 backdrop-blur-[2px] relative [perspective:1200px]"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="about-header-item text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2 will-change-transform">
            System Architecture
          </div>
          <h2 className="about-header-item text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4 will-change-transform">
            An end-to-end curriculum pipeline.
          </h2>
          <p className="about-header-item text-base text-muted-foreground leading-relaxed will-change-transform">
            EduScrapeApp bridges the gap between raw, scattered state board archives and accessible study formats through automated scraping, quality grading, and dual cloud/hardware delivery.
          </p>
        </div>

        {/* Bento Grid (Asymmetric 12-column layout) */}
        <div className="gsap-bento-grid grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Bento Cell 1: Automated Scraping & Catalog Builder (7 cols) */}
          <div className="gsap-bento-card spotlight-card lg:col-span-7 p-6 sm:p-8 rounded-md border border-border bg-card flex flex-col justify-between transition-colors hover:border-muted-foreground will-change-transform [transform-style:preserve-3d]">
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  INGESTION ENGINE
                </span>
                <Badge variant="blue" className="text-[10px]">
                  PYTHON AUTOMATION
                </Badge>
              </div>

              <h3 className="text-xl font-bold tracking-tight text-foreground mb-3 flex items-center gap-2">
                <DownloadCloud className="w-5 h-5 text-foreground shrink-0" />
                <span>Recursive State &amp; NCERT Catalog Ingestion</span>
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                Traverses digital education repositories, cataloging Class 1 through Class 12 materials into standardized JSON taxonomies with grade, subject, and chapter hierarchies.
              </p>

              {/* Ingestion Stream Mockup */}
              <div className="p-3.5 rounded-md border border-border bg-secondary font-mono text-[11px] space-y-2 mb-6">
                <div className="text-[10px] uppercase text-muted-foreground flex items-center justify-between">
                  <span>Active Scraper Ingestion Stream</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="space-y-1 text-muted-foreground">
                  <div className="text-foreground">✓ [HTTP 200] Fetching NCERT Class 10 Mathematics PDF</div>
                  <div>✓ Parsing Table of Contents: 14 chapters extracted</div>
                  <div>✓ Uploading payload to Firebase / Cloud CDN bucket</div>
                  <div className="text-emerald-600 dark:text-emerald-400">→ Status: Sync Complete (14.2 MB processed)</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono relative z-10">
              <span>Throughput: ~250 pages/min</span>
              <span>JSON Schema v2.1</span>
            </div>
          </div>

          {/* Bento Cell 2: Interactive OCR Sanitizer & Watermark Removal Scrubber (5 cols) */}
          <div className="gsap-bento-card spotlight-card lg:col-span-5 p-6 sm:p-8 rounded-md border border-border bg-card flex flex-col justify-between transition-colors hover:border-muted-foreground will-change-transform [transform-style:preserve-3d]">
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  PRE-PROCESSING
                </span>
                <Badge variant="green" className="text-[10px]">
                  OCR SANITIZER
                </Badge>
              </div>

              <h3 className="text-xl font-bold tracking-tight text-foreground mb-3 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-foreground shrink-0" />
                <span>Watermark Cleansing</span>
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                Removes government stamps and library scan artifacts to maximize readability on low-cost screens.
              </p>

              {/* Interactive Scrubber Simulator */}
              <div className="p-4 rounded-md border border-border bg-secondary font-mono space-y-3 mb-4">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Sanitization Level:</span>
                  <span className="font-semibold text-foreground">{scrubberValue}%</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scrubberValue}
                  onChange={(e) => setScrubberValue(Number(e.target.value))}
                  className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-foreground"
                  aria-label="Sanitization Scrubber Level"
                />

                {/* Simulated Document Preview with dynamic watermark */}
                <div className="relative p-3 rounded border border-border bg-card overflow-hidden select-none min-h-[90px] flex flex-col justify-center">
                  {/* Dynamic Watermark Stamp */}
                  <div
                    className="absolute inset-0 flex items-center justify-center font-bold text-red-500 uppercase tracking-widest text-base transform -rotate-12 pointer-events-none transition-opacity"
                    style={{ opacity: watermarkOpacity }}
                  >
                    STATE REPOSITORY WATERMARK
                  </div>

                  <div className="relative z-10 text-[11px] text-foreground space-y-1">
                    <p className="font-semibold">Theorem 1.2 (Fundamental Arithmetic):</p>
                    <p className="text-muted-foreground text-[10px]">
                      Every composite number can be expressed as a product of primes uniquely up to factor order.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono relative z-10">
              <span>Artifact Rate: 0.00%</span>
              <span className="text-emerald-600 dark:text-emerald-400">Filter: CLAHE OpenCV</span>
            </div>
          </div>

          {/* Bento Cell 3: Interactive Gemini 2.0 Flash Vision Assistant (5 cols) */}
          <div className="gsap-bento-card spotlight-card lg:col-span-5 p-6 sm:p-8 rounded-md border border-border bg-card flex flex-col justify-between transition-colors hover:border-muted-foreground will-change-transform [transform-style:preserve-3d]">
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  AI ASSISTANT
                </span>
                <Badge variant="amber" className="text-[10px]">
                  GEMINI 2.0 FLASH
                </Badge>
              </div>

              <h3 className="text-xl font-bold tracking-tight text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-foreground shrink-0" />
                <span>Multimodal Page Explainer</span>
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                Extracts mathematical notation, chemical reactions, and biology diagrams directly from textbook page coordinates.
              </p>

              {/* Interactive AI Prompt Selector */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono pb-1">
                  {aiPrompts.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePromptIndex(idx)}
                      className={`px-2 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${activePromptIndex === idx
                          ? "bg-secondary text-foreground font-semibold border border-border"
                          : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {item.grade}
                    </button>
                  ))}
                </div>

                <div className="p-3 rounded-md border border-border bg-secondary font-mono text-[11px] space-y-2">
                  <div className="text-muted-foreground flex items-center gap-1">
                    <span className="text-foreground font-semibold">Q:</span>
                    <span>{aiPrompts[activePromptIndex].q}</span>
                  </div>
                  <div className="text-foreground pt-1 border-t border-border/60">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Gemini:</span>{" "}
                    {aiPrompts[activePromptIndex].a}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono relative z-10">
              <span>Token Latency: ~180ms</span>
              <span>Model: gemini-2.0-flash</span>
            </div>
          </div>

          {/* Bento Cell 4: Dual Delivery Architecture (7 cols) */}
          <div className="gsap-bento-card spotlight-card lg:col-span-7 p-6 sm:p-8 rounded-md border border-border bg-card flex flex-col justify-between transition-colors hover:border-muted-foreground will-change-transform [transform-style:preserve-3d]">
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  HYBRID DISTRIBUTION
                </span>
                <Badge variant="mono" className="text-[10px]">
                  CLOUD + HARDWARE
                </Badge>
              </div>

              <h3 className="text-xl font-bold tracking-tight text-foreground mb-3 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-foreground shrink-0" />
                <span>Web Platform &amp; ESP32 Embedded Sync</span>
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                Students access reading material either online via our high-speed React web portal or offline through dedicated low-power ESP32 physical reading units.
              </p>

              {/* Dual System Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="p-3.5 rounded-md border border-border bg-secondary">
                  <div className="font-semibold text-foreground flex items-center justify-between mb-1 text-xs">
                    <span>Cloud Hub (Web)</span>
                    <Badge variant="blue" className="text-[10px] px-1.5 py-0.5">
                      ONLINE
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-sans">
                    React 19 + Supabase Auth + PDF.js renderer with instant chapter navigation.
                  </p>
                </div>

                <div className="p-3.5 rounded-md border border-border bg-secondary">
                  <div className="font-semibold text-foreground flex items-center justify-between mb-1 text-xs">
                    <span>ESP32 Device</span>
                    <Badge variant="amber" className="text-[10px] px-1.5 py-0.5">
                      OFFLINE
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-sans">
                    Dual-core MCU with MicroSD FAT32 interface &amp; hardware D-pad page controls.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono relative z-10">
              <span className="flex items-center gap-1.5">
                <BookCheck className="w-3.5 h-3.5 text-emerald-500" />
                Sync Status: Unified Protocol
              </span>
              <span>100% Autonomous</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
