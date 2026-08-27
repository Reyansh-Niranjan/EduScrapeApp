import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import {
  Menu,
  X,
  ArrowUpRight,
  Sparkles,
  BookOpen,
  Terminal,
  Cpu,
  User,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Close mobile menu on Escape & lock body scroll on mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // GSAP Scroll Progress Indicator
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
    { label: "Overview", href: "#home", icon: Sparkles },
    { label: "Architecture", href: "#about", icon: Terminal },
    { label: "Ecosystem", href: "#ecosystem", icon: Cpu },
    { label: "Creator", href: "#creator", icon: User },
  ];

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

  const navigateToLogin = () => {
    setMobileMenuOpen(false);
    window.history.pushState({}, "", "#login");
    window.dispatchEvent(new Event("hashchange"));
  };

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-background/90 backdrop-blur-md transition-colors"
    >
      {/* GSAP Scroll Progress Scrubber */}
      <div
        ref={progressBarRef}
        className="absolute top-0 left-0 right-0 h-[2px] bg-foreground origin-left scale-x-0 z-50 pointer-events-none"
      />

      <div className="container mx-auto px-4 sm:px-6 h-full max-w-6xl flex items-center justify-between">
        {/* Brand Lockup */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, "#home")}
          className="flex items-center gap-2.5 text-foreground hover:opacity-85 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-sm touch-manipulation active:scale-[0.97]"
        >
          <div className="h-7 w-7 rounded-md bg-foreground text-background flex items-center justify-center font-bold font-mono text-xs shadow-xs">
            E
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm tracking-tight text-foreground">
              EduScrapeApp
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-muted-foreground">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-sm py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Action Controls */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Button
            size="sm"
            onClick={navigateToLogin}
            className="text-xs h-8 px-3 py-1.5 gap-1.5 font-medium cursor-pointer"
          >
            <span>Sign In</span>
            <ArrowUpRight className="w-3 h-3 opacity-70" />
          </Button>
        </div>

        {/* Mobile Action Controls & Hamburger Trigger */}
        <div className="flex items-center gap-1.5 md:hidden">
          <ThemeToggle />
          
          <Button
            size="sm"
            onClick={navigateToLogin}
            className="h-8 px-2.5 text-xs font-medium gap-1 touch-manipulation active:scale-[0.97]"
          >
            <span>Sign In</span>
            <ArrowUpRight className="w-3 h-3" />
          </Button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-border text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground touch-manipulation active:scale-[0.95]"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Bottom Sheet Portal with Emil Kowalski Spring Physics */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {mobileMenuOpen && (
              <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                />

                {/* Bottom Sheet Modal */}
                <motion.div
                  id="mobile-nav-menu"
                  role="navigation"
                  aria-label="Mobile navigation"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 350 }}
                  className="relative z-10 w-full max-h-[85dvh] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-5 safe-bottom shadow-2xl space-y-4"
                >
                  {/* Sheet Drag Handle */}
                  <div className="flex justify-center -mt-2 pb-1">
                    <div className="w-10 h-1 rounded-full bg-border" />
                  </div>

                  {/* Sheet Header */}
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-foreground text-background flex items-center justify-center font-mono font-bold text-xs">
                        E
                      </div>
                      <span className="font-bold text-sm text-foreground">Navigation</span>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors touch-manipulation active:scale-95 cursor-pointer"
                      aria-label="Close navigation"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Nav Items List with 48px touch targets */}
                  <div className="space-y-1">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <a
                          key={link.href}
                          href={link.href}
                          onClick={(e) => handleNavClick(e, link.href)}
                          className="flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors touch-manipulation active:scale-[0.98] cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-secondary text-foreground">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span>{link.label}</span>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                        </a>
                      );
                    })}
                  </div>

                  {/* Primary Mobile Action */}
                  <div className="pt-2 border-t border-border space-y-2">
                    <Button
                      size="lg"
                      onClick={navigateToLogin}
                      className="w-full h-11 text-xs font-semibold justify-center gap-2 touch-manipulation active:scale-[0.98] shadow-xs"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Launch Digital Library</span>
                    </Button>

                    <div className="pt-2 flex items-center justify-between text-xs font-mono text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-foreground" />
                        Class 1–12 Open Access
                      </span>
                      <a
                        href="https://github.com/Reyansh-Niranjan/eduscrapeappweb"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-foreground hover:underline"
                      >
                        GitHub <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  );
}
