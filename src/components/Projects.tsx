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
        "High-density web application providing instant PDF reading, Class 1–12 curriculum hierarchy, deep AI vision diagram search, and direct chapter downloads.",
      specs: [
        { label: "Frontend", value: "React 19 · Vite 8" },
        { label: "Auth & DB", value: "Supabase PostgreSQL" },
        { label: "CDN Storage", value: "Firebase Hosting" },
        { label: "Vision AI", value: "Gemini 2.0 Flash" },
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
        "Autonomous ESP32 physical reader with tactile D-pad navigation, monochrome display, and MicroSD storage. Built for offline study in remote areas with zero internet connectivity.",
      specs: [
        { label: "Processor", value: "ESP-WROOM-32 Dual Core" },
        { label: "Storage Bus", value: "MicroSD FAT32 SPI" },
        { label: "Firmware", value: "Custom C++ Display Driver" },
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
      // Header blur reveal
      gsap.from(".projects-header-item", {
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

      // Cards Blur-to-Focus Glide entrance
      gsap.from(".gsap-ecosystem-card", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
        y: 40,
        filter: "blur(14px)",
        autoAlpha: 0,
        stagger: 0.18,
        duration: 0.9,
        ease: "power4.out",
      });

      // Parallax image scrub inside media frames (Inspired by subscrr.app data-parallax)
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
    },
    { scope: containerRef }
  );

  return (
    <section
      id="features"
      ref={containerRef}
      className="py-24 border-b border-border bg-background/80 backdrop-blur-[2px] relative [perspective:1200px]"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="projects-header-item text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2 will-change-transform">
            Dual Platform Ecosystem
          </div>
          <h2 className="projects-header-item text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4 will-change-transform">
            Cloud web hub &amp; offline hardware.
          </h2>
          <p className="projects-header-item text-base text-muted-foreground leading-relaxed will-change-transform">
            A unified content pipeline engineered to serve both high-bandwidth environments and rural regions with zero network infrastructure.
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
                <div className="relative aspect-[16/10] w-full border-b border-border bg-secondary overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="parallax-media-img w-full h-full object-cover object-top will-change-transform"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant={item.badgeVariant} className="text-[10px]">
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

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                      {item.description}
                    </p>

                    {/* Technical Specs Table */}
                    <div className="p-4 rounded-md border border-border bg-secondary/50 mb-6 font-mono text-xs">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center justify-between">
                        <span>Architecture Specifications</span>
                        <Terminal className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                        {item.specs.map((spec, sIdx) => (
                          <div key={sIdx} className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground">{spec.label}</span>
                            <span className="font-semibold text-foreground text-[11px] truncate mt-0.5">
                              {spec.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    {item.actionHash ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          window.location.hash = item.actionHash!;
                        }}
                        className="flex-1 justify-center text-xs gap-1.5 cursor-pointer shadow-xs hover:shadow-sm"
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
                        <Button size="sm" className="w-full justify-center text-xs gap-1.5 cursor-pointer shadow-xs hover:shadow-sm">
                          {item.actionText}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                    )}

                    <a
                      href={item.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground text-xs font-mono inline-flex items-center gap-1.5 transition-colors hover:border-muted-foreground"
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
