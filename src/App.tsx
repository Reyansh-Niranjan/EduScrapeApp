import { Suspense, lazy, useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import About from "./components/About";
import ErrorBoundary from "./components/ErrorBoundary";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import Creator from "./components/Creator";
import BackgroundCanvas from "./components/BackgroundCanvas";
import { supabase } from "./lib/supabaseClient";

gsap.registerPlugin(ScrollTrigger);

const Login = lazy(() => import("./components/Login"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./components/TermsOfService"));

function FullPageLoader() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-border border-t-foreground" />
        <p className="text-xs font-mono text-muted-foreground">Loading workspace…</p>
      </div>
    </div>
  );
}

type View = "home" | "login" | "dashboard" | "privacy" | "terms";

const getViewFromURL = (): View => {
  const { pathname, hash } = window.location;

  if (hash.startsWith("#login")) return "login";
  if (hash.startsWith("#dashboard")) return "dashboard";
  if (hash.startsWith("#privacy")) return "privacy";
  if (hash.startsWith("#terms")) return "terms";

  if (pathname === "/login") return "login";
  if (pathname === "/dashboard") return "dashboard";
  if (pathname === "/privacy") return "privacy";
  if (pathname === "/terms") return "terms";

  return "home";
};

export default function App() {
  const [currentView, setCurrentView] = useState<View>(getViewFromURL);

  // Initialize Lenis physics smooth scroll hooked to GSAP ticker (Inspired by subscrr.app & walaszczyk.studio)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.4,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const handleTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(handleTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(handleTicker);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    document.documentElement.setAttribute("data-theme", shouldBeDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", shouldBeDark);

    const handleRouteChange = () => {
      if (window.location.hash.includes("access_token")) {
        const baseHash = window.location.hash.split("#")[1] || "";
        const target = baseHash ? `#${baseHash}` : "#";
        try {
          window.history.replaceState({}, "", `${window.location.pathname}${target}`);
        } catch {
          // noop
        }
      }
      setCurrentView(getViewFromURL());
    };

    window.addEventListener("hashchange", handleRouteChange);
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("hashchange", handleRouteChange);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const goToDashboard = () => {
      try {
        window.history.pushState({}, "", "/");
      } catch {
        // noop
      }
      window.location.hash = "#dashboard";
      setCurrentView("dashboard");
    };

    const checkSession = async () => {
      if (currentView !== "home" && currentView !== "login") return;
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (data.session) {
        goToDashboard();
      }
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") return;
      if (session && (currentView === "home" || currentView === "login")) {
        goToDashboard();
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [currentView]);

  useEffect(() => {
    if (currentView === "privacy" || currentView === "terms") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentView]);

  return (
    <ErrorBoundary>
      <Analytics />
      <div className="min-h-[100dvh] relative bg-background text-foreground">
        {/* Ambient GPU Constellation Canvas (home view only) */}
        {currentView === "home" && <BackgroundCanvas />}

        {currentView === "login" ? (
          <Suspense fallback={<FullPageLoader />}>
            <Login
              onCancel={() => {
                try {
                  window.history.pushState({}, "", "/");
                } catch {
                  // noop
                }
                window.location.hash = "";
                setCurrentView("home");
              }}
              onSuccess={() => {
                try {
                  window.history.pushState({}, "", "/");
                } catch {
                  // noop
                }
                window.location.hash = "#dashboard";
                setCurrentView("dashboard");
              }}
            />
          </Suspense>
        ) : currentView === "dashboard" ? (
          <Suspense fallback={<FullPageLoader />}>
            <Dashboard
              onLogout={() => {
                try {
                  window.history.pushState({}, "", "/");
                } catch {
                  // noop
                }
                window.location.hash = "";
                setCurrentView("home");
              }}
            />
          </Suspense>
        ) : currentView === "privacy" || currentView === "terms" ? (
          <>
            <Header />
            <main className="relative z-10">
              <Suspense fallback={<FullPageLoader />}>
                {currentView === "privacy" ? <PrivacyPolicy /> : <TermsOfService />}
              </Suspense>
            </main>
            <Footer />
          </>
        ) : (
          <>
            <Header />
            <main className="relative z-10">
              <Hero />
              <hr className="border-border m-0" />
              <About />
              <hr className="border-border m-0" />
              <Projects />
              <hr className="border-border m-0" />
              <Creator />
            </main>
            <Footer />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
