import { Github, Terminal } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary/40 py-12 text-xs">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-border">
          
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-foreground text-background flex items-center justify-center font-mono font-bold text-[10px]">
                E
              </div>
              <span className="font-bold text-sm tracking-tight text-foreground">
                EduScrapeApp
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              Automated curriculum pipeline, OCR watermark stripping, and offline educational delivery for K–12 textbooks across India.
            </p>
          </div>

          {/* Nav Links */}
          <div className="md:col-span-3 space-y-2 font-mono text-[11px]">
            <div className="text-muted-foreground uppercase text-[10px] tracking-wider mb-2">
              Navigation
            </div>
            <div>
              <a href="#home" className="text-muted-foreground hover:text-foreground">Overview</a>
            </div>
            <div>
              <a href="#about" className="text-muted-foreground hover:text-foreground">Architecture</a>
            </div>
            <div>
              <a href="#features" className="text-muted-foreground hover:text-foreground">Platform &amp; Hardware</a>
            </div>
            <div>
              <a href="#creator" className="text-muted-foreground hover:text-foreground">Creator</a>
            </div>
          </div>

          {/* Legal & Repos */}
          <div className="md:col-span-4 space-y-2 font-mono text-[11px]">
            <div className="text-muted-foreground uppercase text-[10px] tracking-wider mb-2">
              Repositories &amp; Legal
            </div>
            <div>
              <a
                href="https://github.com/Reyansh-Niranjan/eduscrapeappweb"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
              >
                <Github className="w-3 h-3" />
                Web Hub Repo
              </a>
            </div>
            <div>
              <a
                href="https://github.com/Reyansh-Niranjan/EduScrapeApp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
              >
                <Terminal className="w-3 h-3" />
                ESP32 Hardware Firmware
              </a>
            </div>
            <div className="pt-1 flex gap-3 text-muted-foreground">
              <a href="#privacy" className="hover:text-foreground">Privacy Policy</a>
              <span>·</span>
              <a href="#terms" className="hover:text-foreground">Terms of Service</a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-muted-foreground text-[11px] font-mono">
          <div>
            &copy; {currentYear} EduScrapeApp. Created &amp; engineered by{" "}
            <a
              href="https://github.com/Reyansh-Niranjan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline font-semibold"
            >
              Reyansh Niranjan
            </a>.
          </div>

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Open Source · MIT License</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
