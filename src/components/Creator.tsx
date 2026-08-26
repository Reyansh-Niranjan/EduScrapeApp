import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Github, MapPin, ShieldCheck, Terminal, Code2, Cpu, Database, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface CreatorProfile {
  login: string;
  name: string | null;
  avatar_url: string | null;
  html_url: string;
  bio: string | null;
  followers: number;
  following: number;
  public_repos: number;
  location: string | null;
}

export default function Creator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fallbackAvatar = "https://github.com/Reyansh-Niranjan.png";

  useEffect(() => {
    const controller = new AbortController();
    const loadCreator = async () => {
      try {
        const response = await fetch("https://api.github.com/users/Reyansh-Niranjan", {
          signal: controller.signal,
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!response.ok) {
          throw new Error("GitHub profile request failed");
        }
        const data = (await response.json()) as CreatorProfile;
        setCreator(data);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setCreator(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCreator();
    return () => controller.abort();
  }, []);

  useGSAP(
    () => {
      // Header blur reveal
      gsap.from(".creator-header-item", {
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

      // Creator cards Blur-to-Focus Glide reveal
      gsap.from(".gsap-creator-card", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
        y: 40,
        filter: "blur(14px)",
        autoAlpha: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: "power4.out",
      });

      // QuickTo tilt physics & spotlight coordination on creator cards
      const cards = gsap.utils.toArray<HTMLElement>(".gsap-creator-card", containerRef.current);
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

  const corePillars = [
    {
      title: "Web Platform Architecture",
      desc: "Built the React 19 + Vite digital library, in-browser PDF rendering engine, and Supabase auth.",
      icon: Code2,
      tag: "FRONTEND & DB",
    },
    {
      title: "Scraper & Ingestion Pipeline",
      desc: "Developed Python automation for recursive NCERT crawling, PDF watermark removal, and taxonomy syncing.",
      icon: Database,
      tag: "AUTOMATION & OCR",
    },
    {
      title: "ESP32 Embedded System",
      desc: "Engineered physical prototype with C++ display drivers and FAT32 SD card reader for offline classrooms.",
      icon: Cpu,
      tag: "EMBEDDED C++",
    },
  ];

  return (
    <section
      id="creator"
      ref={containerRef}
      className="py-24 border-b border-border bg-background/80 backdrop-blur-[2px] relative [perspective:1200px]"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="creator-header-item text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2 will-change-transform">
            Engineering &amp; Creator
          </div>
          <h2 className="creator-header-item text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4 will-change-transform">
            Designed &amp; engineered by Reyansh Niranjan.
          </h2>
          <p className="creator-header-item text-base text-muted-foreground leading-relaxed will-change-transform">
            EduScrapeApp is an independent software and hardware engineering initiative designed to close the educational content accessibility gap across India.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Creator Profile (7 cols) */}
          <div className="gsap-creator-card spotlight-card lg:col-span-7 rounded-md border border-border bg-card p-6 sm:p-8 transition-colors hover:border-muted-foreground will-change-transform [transform-style:preserve-3d]">
            {/* Top Telemetry Line */}
            <div className="flex items-center justify-between pb-4 border-b border-border mb-6 relative z-10">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>api.github.com/users/Reyansh-Niranjan</span>
              </div>
              <Badge variant="green" className="text-[10px] gap-1">
                <ShieldCheck className="w-3 h-3" />
                VERIFIED AUTHOR
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 text-center sm:text-left relative z-10">
              {/* Avatar Frame */}
              <div className="relative h-20 w-20 rounded-md overflow-hidden border border-border bg-secondary shrink-0">
                <img
                  src={creator?.avatar_url || fallbackAvatar}
                  alt="Reyansh Niranjan"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Bio Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h3 className="text-xl font-bold text-foreground">
                    {creator?.name || "Reyansh Niranjan"}
                  </h3>
                  {creator?.login && (
                    <a
                      href={creator.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-muted-foreground hover:text-foreground inline-flex items-center justify-center sm:justify-start gap-1"
                    >
                      <Github className="w-3.5 h-3.5" />
                      @{creator.login}
                      <ArrowUpRight className="w-3 h-3 opacity-60" />
                    </a>
                  )}
                </div>

                <div className="text-xs font-mono text-muted-foreground mb-2">
                  Solo Creator · Full-Stack &amp; Embedded Systems
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {creator?.bio ||
                    "Architect of EduScrapeApp and the ESP32 offline educational ecosystem. Focused on automated data pipelines, web platforms, and offline-first hardware."}
                </p>

                {creator?.location && (
                  <div className="mt-3 flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-muted-foreground font-mono">
                    <MapPin className="w-3 h-3" />
                    <span>{creator.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Live Metrics Grid (Monospace) */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-md border border-border bg-secondary font-mono text-center relative z-10">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase">Public Repos</span>
                <span className="text-xl font-semibold text-foreground mt-0.5">
                  {isLoading ? "–" : creator?.public_repos ?? "14"}
                </span>
              </div>
              <div className="flex flex-col border-x border-border">
                <span className="text-[10px] text-muted-foreground uppercase">Followers</span>
                <span className="text-xl font-semibold text-foreground mt-0.5">
                  {isLoading ? "–" : creator?.followers ?? "8"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase">Following</span>
                <span className="text-xl font-semibold text-foreground mt-0.5">
                  {isLoading ? "–" : creator?.following ?? "12"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Engineering Pillars (5 cols) */}
          <div className="gsap-creator-card spotlight-card lg:col-span-5 rounded-md border border-border bg-card p-6 sm:p-8 space-y-4 transition-colors hover:border-muted-foreground will-change-transform [transform-style:preserve-3d]">
            <div className="pb-3 border-b border-border flex items-center justify-between relative z-10">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Terminal className="w-4 h-4 text-muted-foreground" />
                Technical Scope
              </h4>
              <Badge variant="mono" className="text-[10px]">
                SOLO AUTHOR
              </Badge>
            </div>

            <div className="space-y-3 relative z-10">
              {corePillars.map((pillar, pIdx) => {
                const Icon = pillar.icon;
                return (
                  <div key={pIdx} className="p-3.5 rounded-md border border-border bg-secondary/50">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{pillar.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">{pillar.tag}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{pillar.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-muted-foreground relative z-10">
              <span>Open Source Codebase</span>
              <a
                href="https://github.com/Reyansh-Niranjan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                GitHub Profile <ArrowUpRight className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
