import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, Layers, Cpu, Globe } from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function KineticScrollText() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const statement = [
    { text: "Every student", highlight: false },
    { text: "deserves instantaneous,", highlight: false },
    { text: "unrestricted access", highlight: true },
    { text: "to certified curriculum.", highlight: false },
    { text: "We automate", highlight: false },
    { text: "discovery, remove", highlight: false },
    { text: "watermark artifacts,", highlight: true },
    { text: "and broadcast", highlight: false },
    { text: "directly to offline", highlight: false },
    { text: "ESP32 silicon.", highlight: true },
  ];

  useGSAP(
    () => {
      const words = gsap.utils.toArray<HTMLElement>(".scroll-scrub-word", textRef.current);
      if (!words.length || !containerRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
          end: "bottom 30%",
          scrub: 0.8,
        },
      });

      tl.to(words, {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        stagger: 0.08,
        ease: "none",
      });

      if (progressRef.current) {
        gsap.to(progressRef.current, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            end: "bottom 30%",
            scrub: true,
          },
        });
      }
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="py-32 border-b border-border bg-background/90 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary text-[11px] font-mono text-muted-foreground mb-8">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>KINETIC SCROLL SCRUB · MANIFESTO</span>
          </div>

          {/* Large Kinetic Text Container */}
          <p
            ref={textRef}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.25] text-foreground mb-12 select-none"
          >
            {statement.map((item, idx) => (
              <span
                key={idx}
                className={`scroll-scrub-word inline-block mr-[0.28em] opacity-15 filter blur-[4px] translate-y-2 transition-colors will-change-[transform,opacity,filter] ${
                  item.highlight
                    ? "font-serif-italic font-normal text-muted-foreground"
                    : "text-foreground"
                }`}
              >
                {item.text}
              </span>
            ))}
          </p>

          {/* Scrub Track Indicator */}
          <div className="w-full max-w-md h-[2px] bg-secondary rounded-full overflow-hidden mb-4">
            <div
              ref={progressRef}
              className="h-full bg-foreground origin-left scale-x-0 will-change-transform"
            />
          </div>

          {/* Telemetry Micro-Pill Details */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono text-muted-foreground pt-2">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> 10,000+ Curricula Processed
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Zero Human Bottlenecks
            </span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Offline-First Silicon
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
