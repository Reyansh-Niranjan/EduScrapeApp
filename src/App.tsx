import { Suspense, lazy, useEffect, useState } from "react";
import About from "./components/About";
import ErrorBoundary from "./components/ErrorBoundary";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import Creator from "./components/Creator";

const Login = lazy(() => import("./components/Login"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./components/TermsOfService"));

function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--theme-bg)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        <p style={{ color: "var(--theme-text-secondary)" }}>Loading…</p>
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

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";

    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    document.documentElement.setAttribute("data-theme", shouldBeDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", shouldBeDark);

    const handleRouteChange = () => {
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
    if (currentView === "privacy" || currentView === "terms") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentView]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen" style={{ background: "var(--theme-bg)" }}>
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
            <main className="relative">
              <Suspense fallback={<FullPageLoader />}>
                {currentView === "privacy" ? <PrivacyPolicy /> : <TermsOfService />}
              </Suspense>
            </main>
            <Footer />
          </>
        ) : (
          <>
            <Header />
            <main className="relative">
              <Hero />
              <About />
              <Projects />
              <Creator />
            </main>
            <Footer />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
