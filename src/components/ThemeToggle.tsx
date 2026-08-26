import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const getTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return savedTheme === "dark" || (!savedTheme && prefersDark) ? "dark" : "light";
};

const applyTheme = (theme: "light" | "dark") => {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.body.setAttribute("data-theme", theme);
  document.body.classList.toggle("dark", theme === "dark");
};

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => getTheme() === "dark");

  useEffect(() => {
    const syncTheme = () => {
      const shouldBeDark = getTheme() === "dark";
      setIsDark(shouldBeDark);
      applyTheme(shouldBeDark ? "dark" : "light");
    };

    syncTheme();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "theme") {
        syncTheme();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    const themeValue = newTheme ? "dark" : "light";
    applyTheme(themeValue);
    localStorage.setItem("theme", themeValue);
  };

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground transition-all active:scale-[0.95]"
      aria-label="Toggle theme"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <Sun className="h-3.5 w-3.5 text-foreground transition-transform duration-150" />
      ) : (
        <Moon className="h-3.5 w-3.5 text-foreground transition-transform duration-150" />
      )}
    </button>
  );
}
