import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DownloadCloud, Sliders, Sparkles, Cpu, Terminal, ArrowRight, ShieldCheck, FileCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface Stage {
  num: string;
  tag: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: typeof DownloadCloud;
  tech: string[];
  metrics: { label: string; val: string }[];
  codeSnippet: string;
  badgeVariant: "blue" | "green" | "amber" | "mono";
}

const stages: Stage[] = [
  {
    num: "01",
    tag: "INGESTION & CRAWLER",
    title: "Recursive Repository Traversal",
    subtitle: "Automated Python Async Workers",
    desc: "Autonomous spiders traverse complex state board archive architectures, resolving deep PDF trees, dynamic JavaScript pagination, and session tokens without human intervention.",
    icon: DownloadCloud,
    tech: ["Asyncio", "Playwright", "HTTPX", "PyMuPDF"],
    metrics: [
      { label: "Target Repos", val: "NCERT + 18 States" },
      { label: "Crawl Concurrency", val: "32 Workers" },
      { label: "Payload Schema", val: "JSON-LD v2.1" },
    ],
    codeSnippet: `async def crawl_catalog(state_id: str):\n  async with AsyncClient(http2=True) as client:\n    tree = await parse_toc_hierarchy(client, state_id)\n    return [ch for ch in tree.iter_chapters()]`,
    badgeVariant: "blue",
  },
  {
    num: "02",
    tag: "COMPUTER VISION OCR",
    title: "Artifact & Watermark Sanitizer",
    subtitle: "Adaptive OpenCV & CLAHE Pipeline",
    desc: "Every raw textbook scan passes through multi-stage morphological operations to detect and erase intrusive government stamps, dark photocopy noise, and skew angles.",
    icon: Sliders,
    tech: ["OpenCV 4.9", "CLAHE", "Otsu Threshold", "Inpainting"],
    metrics: [
      { label: "Watermark Loss", val: "99.8% Cleansed" },
      { label: "Processing Speed", val: "45 ms / Page" },
      { label: "Readability Score", val: "9.4 / 10 Optimal" },
    ],
    codeSnippet: `cv_img = cv2.cvtColor(raw_page, cv2.COLOR_BGR2GRAY)\nclahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))\nclean = cv2.inpaint(clahe.apply(cv_img), mask, 3, cv2.INPAINT_TELEA)`,
    badgeVariant: "green",
  },
  {
    num: "03",
    tag: "MULTIMODAL AI",
    title: "Gemini 2.0 Concept Vectorizer",
    subtitle: "LaTeX Extraction & Diagram Analysis",
    desc: "Gemini 2.0 Flash parses mathematical equations into renderable LaTeX strings, extracts chemistry formulas, and generates instant semantic summaries for student queries.",
    icon: Sparkles,
    tech: ["Gemini 2.0 Flash", "LaTeX MathJax", "Vector Embeddings", "Supabase pgvector"],
    metrics: [
      { label: "Equation Accuracy", val: "99.4% Valid LaTeX" },
      { label: "Context Window", val: "1,000,000 Tokens" },
      { label: "Inference Latency", val: "~180 ms" },
    ],
    codeSnippet: `response = client.models.generate_content(\n  model="gemini-2.0-flash",\n  contents=[page_crop, "Extract all formulas in valid LaTeX"]\n)`,
    badgeVariant: "amber",
  },
  {
    num: "04",
    tag: "EMBEDDED SILICON",
    title: "ESP32 Binary Image Packer",
    subtitle: "FAT32 MicroSD Direct Memory Mapping",
    desc: "Pre-rendered textbook binaries and vector glyphs are compiled into ultra-dense contiguous sectors for instant offline reading on dual-core ESP32 microcontrollers with 0% network reliance.",
    icon: Cpu,
    tech: ["ESP-IDF", "C++ 20", "SPI SD Driver", "Monochrome OLED"],
    metrics: [
      { label: "Frame Seek Time", val: "<12 ms" },
      { label: "Battery Endurance", val: "38+ Hours Run" },
      { label: "Unit Production", val: "<$15 USD BOM" },
    ],
    codeSnippet: `void loadChapterFrame(uint32_t sectorOffset) {\n  sd_spi_read_block(&card, buffer, sectorOffset, 512);\n  epd_draw_bitmap(0, 0, buffer, 400, 300, EPD_BLACK);\n}`,
    badgeVariant: "mono",
  },
];

export default function HorizontalPipeline() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(0);

  useGSAP(
    () => {
      const track = trackRef.current;
      const section = sectionRef.current;
      if (!track || !section) return;

      // Calculate total horizontal scroll distance
      const getScrollAmount = () => {
        return -(track.scrollWidth - window.innerWidth + 120);
      };

      // Main Pinned Horizontal Scroll Tween (Inspired by award-winning Awwwards sites)
      const scrollTween = gsap.to(track, {
        x: getScrollAmount,
        ease: "none", // Critical: must be "none" for accurate 1:1 scroll sync
        scrollTrigger: {
          trigger: section,
          pin: true,
          start: "top top",
          end: () => `+=${track.scrollWidth}`,
          scrub: 0.9,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressLineRef.current) {
              progressLineRef.current.style.transform = `scaleX(${self.progress})`;
            }
            const stageIndex = Math.min(
              stages.length - 1,
              Math.floor(self.progress * stages.length)
            );
            setActiveStage(stageIndex);
          },
        },
      });

      // Individual card parallax and spotlight tracking
      const cards = gsap.utils.toArray<HTMLElement>(".horizontal-pipeline-card", track);
      cards.forEach((card) => {
        const onMove = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
          card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
        };
        card.addEventListener("mousemove", onMove);
      });

      return () => {
        scrollTween.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="pipeline-stream"
      className="h-screen w-full bg-background border-b border-border relative overflow-hidden flex flex-col justify-between"
    >
      {/* Top Header Bar inside pinned viewport */}
      <div className="pt-6 px-6 sm:px-12 flex items-center justify-between z-20 shrink-0 border-b border-border pb-4 bg-background/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            AWWWARDS SCROLL STREAM · PIPELINE FLOW
          </span>
        </div>

        {/* Live Stage Odometer */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-muted-foreground">STAGE:</span>
          <span className="font-bold text-foreground bg-secondary px-2.5 py-1 rounded border border-border">
            0{activeStage + 1} / 0{stages.length}
          </span>
        </div>
      </div>

      {/* Top Horizontal Progress Scrubber */}
      <div className="w-full h-[2px] bg-border relative z-20">
        <div
          ref={progressLineRef}
          className="h-full bg-foreground origin-left scale-x-0 will-change-transform transition-transform"
        />
      </div>

      {/* Pinned Horizontal Scrolling Track */}
      <div className="flex-1 flex items-center relative z-10 overflow-visible py-4">
        <div
          ref={trackRef}
          className="flex items-center gap-8 pl-8 sm:pl-16 pr-24 will-change-transform select-none"
          style={{ width: "max-content" }}
        >
          {/* Section Introduction Card */}
          <div className="w-[340px] sm:w-[420px] shrink-0 flex flex-col justify-center pr-6">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>Full Pipeline Inspection</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
              How EduScrapeApp transforms raw chaos into clean education.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
              Scroll down to travel horizontally through our four-tier autonomous processing pipeline. From state server scraping to zero-power silicon.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span>Scroll to traverse</span>
              <ArrowRight className="w-4 h-4 text-foreground transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* 4 Pipeline Stage Cards */}
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div
                key={idx}
                className="horizontal-pipeline-card spotlight-card w-[380px] sm:w-[500px] lg:w-[560px] shrink-0 p-6 sm:p-8 rounded-md border border-border bg-card flex flex-col justify-between transition-colors hover:border-muted-foreground shadow-sm hover:shadow-lg will-change-transform"
              >
                {/* Top Info */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-xl font-bold text-foreground">{stage.num}</span>
                      <span className="text-[10px] uppercase text-muted-foreground tracking-wider">
                        {stage.tag}
                      </span>
                    </div>
                    <Badge variant={stage.badgeVariant} className="text-[10px]">
                      {stage.subtitle}
                    </Badge>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-2 flex items-center gap-2.5">
                    <Icon className="w-5 h-5 text-foreground shrink-0" />
                    <span>{stage.title}</span>
                  </h3>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-5">
                    {stage.desc}
                  </p>

                  {/* Code Snippet Box */}
                  <div className="p-3 rounded-md border border-border bg-secondary/80 font-mono text-[11px] mb-5 overflow-x-auto leading-tight text-muted-foreground">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground/80 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <FileCode className="w-3 h-3" /> Core Logic Execution
                      </span>
                      <span className="text-emerald-500 font-semibold">EXECUTING</span>
                    </div>
                    <pre className="text-foreground">{stage.codeSnippet}</pre>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-md border border-border bg-secondary/40 font-mono text-center">
                    {stage.metrics.map((m, mIdx) => (
                      <div key={mIdx} className="flex flex-col">
                        <span className="text-[10px] uppercase text-muted-foreground truncate">{m.label}</span>
                        <span className="text-[11px] font-bold text-foreground mt-0.5">{m.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Tech Pills */}
                <div className="pt-4 border-t border-border mt-5 flex items-center justify-between relative z-10 text-[11px] font-mono">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {stage.tech.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border text-[10px]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    Verified
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="pb-4 px-6 sm:px-12 flex items-center justify-between text-[11px] font-mono text-muted-foreground border-t border-border bg-background/80 shrink-0">
        <span>Autonomous Edge Ingestion</span>
        <span>LATENCY: 0.18s · MEMORY: 64MB LEAN</span>
      </div>
    </section>
  );
}
