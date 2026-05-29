import { useEffect } from "react";
import About from "./components/About";
import ErrorBoundary from "./components/ErrorBoundary";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import Creator from "./components/Creator";

export default function App() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";

    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    document.documentElement.setAttribute("data-theme", shouldBeDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen" style={{ background: "var(--theme-bg)" }}>
        <Header />
        <main className="relative">
          <Hero />
          <About />
          <Projects />
          <Creator />
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
