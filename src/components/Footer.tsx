import { Github, Terminal } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary/40 py-10 sm:py-12 safe-bottom text-xs">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-6 sm:gap-8 pb-6 sm:pb-8 border-b border-border">
          {/* Brand Col */}
          <div className="sm:col-span-2 md:col-span-5 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-foreground text-background flex items-center justify-center font-mono font-bold text-xs">
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
          <div className="md:col-span-3 space-y-2 font-mono text-xs">
            <div className="text-muted-foreground uppercase text-[11px] tracking-wider mb-2">
              Navigation
            </div>
            <div className="space-y-1.5">
              <div>
                <a href="#home" className="inline-block py-1 text-muted-foreground hover:text-foreground transition-colors touch-manipulation">Overview</a>
              </div>
              <div>
                <a href="#about" className="inline-block py-1 text-muted-foreground hover:text-foreground transition-colors touch-manipulation">Architecture</a>
              </div>
              <div>
                <a href="#ecosystem" className="inline-block py-1 text-muted-foreground hover:text-foreground transition-colors touch-manipulation">Ecosystem</a>
              </div>
              <div>
                <a href="#creator" className="inline-block py-1 text-muted-foreground hover:text-foreground transition-colors touch-manipulation">Creator</a>
              </div>
            </div>
          </div>

          {/* Legal & Repos */}
          <div className="md:col-span-4 space-y-2 font-mono text-xs">
            <div className="text-muted-foreground uppercase text-[11px] tracking-wider mb-2">
              Repositories &amp; Legal
            </div>
            <div className="space-y-1.5">
              <div>
                <a
                  href="https://github.com/Reyansh-Niranjan/eduscrapeappweb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1 text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5 touch-manipulation"
                >
                  <Github className="w-3.5 h-3.5" />
                  Web Hub Repo
                </a>
              </div>
              <div>
                <a
                  href="https://github.com/Reyansh-Niranjan/EduScrapeApp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1 text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5 touch-manipulation"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  ESP32 Hardware Firmware
                </a>
              </div>
              <div className="pt-1 flex gap-3 text-muted-foreground">
                <a href="#privacy" className="py-1 hover:text-foreground transition-colors touch-manipulation">Privacy Policy</a>
                <span className="py-1">·</span>
                <a href="#terms" className="py-1 hover:text-foreground transition-colors touch-manipulation">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-muted-foreground text-xs font-mono text-center sm:text-left">
          <div>
            &copy; {currentYear} EduScrapeApp. Engineered by{" "}
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
