import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Menu, X, ArrowUpRight } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // GSAP Scroll Progress Indicator (scrubs 0 to 1 based on page scroll)
  useGSAP(
    () => {
      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.1,
          },
        });
      }
    },
    { scope: headerRef }
  );

  const navLinks = [
    { label: "Overview", href: "#home" },
    { label: "Pipeline Stream", href: "#pipeline-stream" },
    { label: "Architecture", href: "#about" },
    { label: "Hardware Anatomy", href: "#hardware-anatomy" },
    { label: "Creator", href: "#creator" },
  ];

  // High-performance GSAP ScrollTo with offset compensation
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    gsap.to(window, {
      duration: 0.85,
      scrollTo: { y: href, offsetY: 56 },
      ease: "power2.inOut",
      overwrite: "auto",
    });
  };

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-background/85 backdrop-blur-md transition-colors"
    >
      {/* GSAP Scroll Progress Indicator */}
      <div
        ref={progressBarRef}
        className="absolute top-0 left-0 right-0 h-[2px] bg-foreground origin-left scale-x-0 z-50 pointer-events-none"
      />

      <div className="container mx-auto px-4 sm:px-6 h-full max-w-6xl flex items-center justify-between">
        {/* Brand Lockup */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, "#home")}
          className="flex items-center gap-2.5 text-foreground hover:opacity-85 transition-opacity"
        >
          <div className="h-7 w-7 rounded-md bg-foreground text-background flex items-center justify-center font-bold font-mono text-xs">
            E
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm tracking-tight text-foreground">
              EduScrapeApp
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              v2.4
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links with GSAP Smooth Scroll */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-muted-foreground">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Controls & Theme Switcher */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Button
            size="sm"
            onClick={() => {
              window.location.hash = "#login";
            }}
            className="text-xs h-8 px-3 gap-1.5 font-medium cursor-pointer"
          >
            <span>Sign In</span>
            <ArrowUpRight className="w-3 h-3 opacity-70" />
          </Button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md border border-border text-foreground hover:bg-secondary transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-3 font-mono text-xs">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="block py-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 border-t border-border">
            <Button
              size="sm"
              onClick={() => {
                setMobileMenuOpen(false);
                window.location.hash = "#login";
              }}
              className="w-full text-xs"
            >
              Sign In to Library
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
