import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  }, []);

  const navigateToHash = useCallback((hash: string) => {
    window.location.hash = hash;
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: "var(--theme-nav-bg)",
        borderBottom: isScrolled ? "1px solid var(--theme-border)" : "none",
        boxShadow: isScrolled ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
        borderBottomLeftRadius: "var(--radius-xl)",
        borderBottomRightRadius: "var(--radius-xl)",
        overflow: "hidden",
      }}
    >
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo-icon.svg" alt="EduScrapeApp" className="w-10 h-10 rounded-lg" />
            <span className="font-bold text-xl" style={{ color: "var(--theme-text)" }}>
              EduScrapeApp
            </span>
          </div>

          <motion.div
            className="hidden md:flex items-center space-x-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.button
              onClick={() => scrollToSection("home")}
              className="font-medium"
              style={{ color: "var(--theme-text-secondary)" }}
              whileHover={{ color: "#8B5CF6", y: -2 }}
              transition={{ duration: 0.2 }}
            >
              Home
            </motion.button>
            <motion.button
              onClick={() => scrollToSection("about")}
              className="font-medium"
              style={{ color: "var(--theme-text-secondary)" }}
              whileHover={{ color: "#8B5CF6", y: -2 }}
              transition={{ duration: 0.2 }}
            >
              Why EduScrapeApp
            </motion.button>
            <motion.button
              onClick={() => scrollToSection("projects")}
              className="font-medium"
              style={{ color: "var(--theme-text-secondary)" }}
              whileHover={{ color: "#8B5CF6", y: -2 }}
              transition={{ duration: 0.2 }}
            >
              Features
            </motion.button>
            <motion.button
              onClick={() => scrollToSection("creator")}
              className="font-medium"
              style={{ color: "var(--theme-text-secondary)" }}
              whileHover={{ color: "#8B5CF6", y: -2 }}
              transition={{ duration: 0.2 }}
            >
              Team
            </motion.button>
          </motion.div>

          <motion.div
            className="hidden md:flex items-center space-x-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <ThemeToggle />
            <motion.button
              onClick={() => navigateToHash("#login")}
              className="btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              Login
            </motion.button>
          </motion.div>

          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ color: "var(--theme-text)" }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden mt-4 pb-4 border-t"
            style={{ borderColor: "var(--theme-border)" }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col space-y-3 pt-4">
              <motion.button
                onClick={() => scrollToSection("home")}
                className="text-left font-medium transition-colors duration-200 hover:text-purple-500"
                style={{ color: "var(--theme-text-secondary)" }}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                Home
              </motion.button>
              <motion.button
                onClick={() => scrollToSection("about")}
                className="text-left font-medium transition-colors duration-200 hover:text-purple-500"
                style={{ color: "var(--theme-text-secondary)" }}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                Why EduScrapeApp
              </motion.button>
              <motion.button
                onClick={() => scrollToSection("projects")}
                className="text-left font-medium transition-colors duration-200 hover:text-purple-500"
                style={{ color: "var(--theme-text-secondary)" }}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                Features
              </motion.button>
              <motion.button
                onClick={() => scrollToSection("creator")}
                className="text-left font-medium transition-colors duration-200 hover:text-purple-500"
                style={{ color: "var(--theme-text-secondary)" }}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                Team
              </motion.button>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-[var(--theme-text-secondary)]">Appearance</span>
                <ThemeToggle />
              </div>
              <motion.button
                onClick={() => navigateToHash("#login")}
                className="btn-primary text-center mt-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                Login / Sign Up
              </motion.button>
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
}
