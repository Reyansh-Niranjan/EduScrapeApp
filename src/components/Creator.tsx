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
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Header reveal
        gsap.from(".creator-header-item", {
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

        // Creator cards Glide reveal
        gsap.from(".gsap-creator-card", {
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            once: true,
          },
          y: 20,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 0.35,
          ease: "power3.out",
          immediateRender: false,
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
      });

      return () => mm.revert();
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
      className="py-24 bg-background relative [perspective:1200px]"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="creator-header-item text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 will-change-transform">
            ENGINEERING &amp; AUTHORSHIP
          </div>
          <h2 className="creator-header-item text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4 will-change-transform">
            Designed &amp; engineered by Reyansh Niranjan.
          </h2>
          <p className="creator-header-item text-base text-muted-foreground leading-relaxed max-w-[50ch] will-change-transform">
            EduScrapeApp is an independent open-source software and hardware engineering project created to democratize access to K–12 educational materials across India.
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
              <Badge variant="green" className="gap-1">
                <ShieldCheck className="w-3 h-3" />
                VERIFIED AUTHOR
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 text-center sm:text-left relative z-10">
              {/* Direct Avatar Image */}
              <img
                src={creator?.avatar_url || fallbackAvatar}
                alt="Reyansh Niranjan"
                className="h-20 w-20 rounded-md object-cover border border-border bg-secondary shrink-0"
              />

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
                  Solo Creator · Full-Stack &amp; Embedded Systems Engineer
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed max-w-[48ch]">
                  {creator?.bio ||
                    "Architect of EduScrapeApp and the ESP32 offline educational ecosystem. Focused on automated data extraction pipelines, modern web applications, and offline-first physical hardware."}
                </p>

                {creator?.location && (
                  <div className="mt-3 flex items-center justify-center sm:justify-start gap-1.5 text-xs text-muted-foreground font-mono">
                    <MapPin className="w-3 h-3" />
                    <span>{creator.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Live Metrics Grid (Semantic list safe tag with py-2.5 px-3 padding) */}
            <ul className="grid grid-cols-3 gap-0 pt-6 border-t border-border font-mono text-center relative z-10 list-none p-0 m-0">
              <li className="flex flex-col py-2.5 px-3">
                <span className="text-xs text-muted-foreground uppercase">Public Repos</span>
                <span className="text-xl font-semibold text-foreground mt-0.5">
                  {isLoading ? "–" : creator?.public_repos ?? "14"}
                </span>
              </li>
              <li className="flex flex-col py-2.5 px-3 border-x border-border">
                <span className="text-xs text-muted-foreground uppercase">Followers</span>
                <span className="text-xl font-semibold text-foreground mt-0.5">
                  {isLoading ? "–" : creator?.followers ?? "8"}
                </span>
              </li>
              <li className="flex flex-col py-2.5 px-3">
                <span className="text-xs text-muted-foreground uppercase">Following</span>
                <span className="text-xl font-semibold text-foreground mt-0.5">
                  {isLoading ? "–" : creator?.following ?? "12"}
                </span>
              </li>
            </ul>
          </div>

          {/* Right Column: Engineering Pillars (5 cols) */}
          <div className="gsap-creator-card spotlight-card lg:col-span-5 rounded-md border border-border bg-card p-6 sm:p-8 space-y-4 transition-colors hover:border-muted-foreground will-change-transform [transform-style:preserve-3d]">
            <div className="pb-3 border-b border-border flex items-center justify-between relative z-10">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Terminal className="w-4 h-4 text-muted-foreground" />
                Technical Scope
              </h4>
              <Badge variant="mono">
                SOLO AUTHOR
              </Badge>
            </div>

            <ul className="space-y-3 relative z-10 list-none p-0 m-0">
              {corePillars.map((pillar, pIdx) => {
                const Icon = pillar.icon;
                return (
                  <li key={pIdx} className="p-3.5 rounded-md bg-secondary/50">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{pillar.title}</span>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground uppercase">{pillar.tag}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{pillar.desc}</p>
                  </li>
                );
              })}
            </ul>

            <div className="pt-3 flex items-center justify-between text-xs font-mono text-muted-foreground relative z-10">
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
