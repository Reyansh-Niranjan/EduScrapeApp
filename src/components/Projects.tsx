import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Globe, Cpu, ArrowUpRight, Github, ExternalLink, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Projects() {
  const containerRef = useRef<HTMLDivElement>(null);

  const ecosystemItems = [
    {
      id: "web-hub",
      name: "EduScrapeApp Web Platform",
      badge: "CLOUD PLATFORM",
      badgeVariant: "blue" as const,
      description:
        "High-performance browser application providing instant high-DPI textbook reading, Class 1–12 catalog search, and offline chapter downloads.",
      specs: [
        { label: "Frontend", value: "React 19 · Vite 8" },
        { label: "Auth & Database", value: "Supabase PostgreSQL" },
        { label: "Storage CDN", value: "Supabase Storage (PDF.js)" },
        { label: "AI Explainer", value: "Gemini 2.0 Flash" },
      ],
      icon: Globe,
      repoUrl: "https://github.com/Reyansh-Niranjan/eduscrapeappweb",
      imageUrl: "/eduscrape_web_banner.svg",
      actionText: "Open Digital Library",
      actionHash: "#login",
    },
    {
      id: "hardware-device",
      name: "EduScraper ESP32 Hardware Device",
      badge: "EMBEDDED HARDWARE",
      badgeVariant: "amber" as const,
      description:
        "Autonomous physical reading device with tactile D-pad navigation, high-contrast monochrome display, and MicroSD card storage for zero-connectivity classrooms.",
      specs: [
        { label: "Processor", value: "ESP-WROOM-32 Dual Core" },
        { label: "Storage Bus", value: "MicroSD FAT32 (SPI)" },
        { label: "Display Driver", value: "Custom Embedded C++" },
        { label: "Page Latency", value: "<12ms Instant Render" },
      ],
      icon: Cpu,
      repoUrl: "https://github.com/Reyansh-Niranjan/EduScrapeApp",
      imageUrl: "/esp32_device.jpeg",
      actionText: "View Hardware Firmware",
      actionLink: "https://github.com/Reyansh-Niranjan/EduScrapeApp",
    },
  ];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Header reveal
        gsap.from(".projects-header-item", {
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

        // Cards Glide entrance
        gsap.from(".gsap-ecosystem-card", {
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            once: true,
          },
          y: 20,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 0.35,
          ease: "power3.out",
          immediateRender: false,
        });

        // Parallax image scrub inside media frames
        const parallaxImages = gsap.utils.toArray<HTMLElement>(".parallax-media-img", containerRef.current);
        parallaxImages.forEach((img) => {
          gsap.fromTo(
            img,
            { yPercent: -7, scale: 1.08 },
            {
              yPercent: 7,
              scale: 1.08,
              ease: "none",
              scrollTrigger: {
                trigger: img.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.2,
              },
            }
          );
        });

        // QuickTo tilt physics & spotlight coordination on ecosystem cards
        const cards = gsap.utils.toArray<HTMLElement>(".gsap-ecosystem-card", containerRef.current);
        cards.forEach((card) => {
          const setRotX = gsap.quickTo(card, "rotationX", { duration: 0.4, ease: "power3.out" });
          const setRotY = gsap.quickTo(card, "rotationY", { duration: 0.4, ease: "power3.out" });

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
      id="ecosystem"
      ref={containerRef}
      className="py-24 bg-background relative [perspective:1200px]"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="projects-header-item text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 will-change-transform">
            DUAL PLATFORM ECOSYSTEM
          </div>
          <h2 className="projects-header-item text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4 will-change-transform">
            Cloud web hub &amp; offline hardware.
          </h2>
          <p className="projects-header-item text-base text-muted-foreground leading-relaxed max-w-[50ch] will-change-transform">
            A single, unified content pipeline engineered to serve both high-bandwidth connected environments and remote regions with zero network infrastructure.
          </p>
        </div>

        {/* 2-Column Showcase with Parallax Scrub and Spotlight */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {ecosystemItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="gsap-ecosystem-card spotlight-card rounded-md border border-border bg-card overflow-hidden flex flex-col justify-between transition-colors hover:border-muted-foreground will-change-transform [transform-style:preserve-3d]"
              >
                {/* Visual Preview Frame with Parallax Image Scrub */}
                <div className="relative aspect-[16/10] w-full border-b border-border overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="parallax-media-img w-full h-full object-cover object-top will-change-transform"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant={item.badgeVariant}>
                      {item.badge}
                    </Badge>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between relative z-10">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-foreground mb-3 flex items-center gap-2">
                      <Icon className="w-5 h-5 text-foreground" />
                      <span>{item.name}</span>
                    </h3>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6 max-w-[48ch]">
                      {item.description}
                    </p>

                    {/* Technical Specs Table (Semantic list safe tag) */}
                    <div className="pt-4 pb-2 border-t border-border mb-6 font-mono text-xs">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center justify-between">
                        <span>Architecture Specifications</span>
                        <Terminal className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <ul className="grid grid-cols-2 gap-y-3 gap-x-4 list-none p-0 m-0">
                        {item.specs.map((spec, sIdx) => (
                          <li key={sIdx} className="flex flex-col">
                            <span className="text-xs text-muted-foreground">{spec.label}</span>
                            <span className="font-semibold text-foreground text-xs truncate mt-0.5">
                              {spec.value}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    {item.actionHash ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          window.history.pushState({}, "", item.actionHash!);
                          window.dispatchEvent(new Event("hashchange"));
                        }}
                        className="flex-1 justify-center text-xs py-1.5 gap-1.5 cursor-pointer shadow-xs hover:shadow-sm"
                      >
                        {item.actionText}
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Button>
                    ) : (
                      <a
                        href={item.actionLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button size="sm" className="w-full justify-center text-xs py-1.5 gap-1.5 cursor-pointer shadow-xs hover:shadow-sm">
                          {item.actionText}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                    )}

                    <a
                      href={item.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground text-xs font-mono inline-flex items-center gap-1.5 transition-colors hover:border-muted-foreground"
                    >
                      <Github className="w-3.5 h-3.5" />
                      Source
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
