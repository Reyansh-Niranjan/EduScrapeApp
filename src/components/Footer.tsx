import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative py-12" style={{ borderTop: "1px solid var(--theme-border)", background: "var(--theme-footer-bg)" }}>
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img src="/logo-icon.svg" alt="EduScrapeApp" className="w-10 h-10 rounded-lg" />
              <span className="font-bold text-xl" style={{ color: "var(--theme-text)" }}>
                EduScrapeApp
              </span>
            </div>
            <p className="mb-6 max-w-md" style={{ color: "var(--theme-text-secondary)" }}>
              The all-in-one platform that keeps curricula fresh, organised, and easy to share. Automate resource discovery,
              ensure alignment with standards, and put engaging content into teachers' hands faster.
            </p>

            <div className="flex gap-4">
              <motion.a
                href="https://github.com/Reyansh-Niranjan/eduscrapeappweb"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="EduScrapeApp on GitHub"
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center opacity-80"
                whileHover={{ scale: 1.1, backgroundColor: "#8B5CF6" }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-5 h-5 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </motion.a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4" style={{ color: "var(--theme-text)" }}>
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <motion.button
                  onClick={() => document.getElementById("home")?.scrollIntoView({ behavior: "smooth" })}
                  className="transition-colors"
                  style={{ color: "var(--theme-text-secondary)" }}
                  whileHover={{ color: "#14B8A6", x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  Home
                </motion.button>
              </li>
              <li>
                <motion.button
                  onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
                  className="transition-colors"
                  style={{ color: "var(--theme-text-secondary)" }}
                  whileHover={{ color: "#14B8A6", x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  Why EduScrapeApp
                </motion.button>
              </li>
              <li>
                <motion.button
                  onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
                  className="transition-colors"
                  style={{ color: "var(--theme-text-secondary)" }}
                  whileHover={{ color: "#14B8A6", x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  Features
                </motion.button>
              </li>
              <li>
                <motion.button
                  onClick={() => document.getElementById("creator")?.scrollIntoView({ behavior: "smooth" })}
                  className="transition-colors"
                  style={{ color: "var(--theme-text-secondary)" }}
                  whileHover={{ color: "#14B8A6", x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  Team
                </motion.button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4" style={{ color: "var(--theme-text)" }}>
              Connect
            </h3>
            <ul className="space-y-2">
              <li>
                <motion.a
                  href="https://github.com/Reyansh-Niranjan/eduscrapeappweb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  style={{ color: "var(--theme-text-secondary)" }}
                  whileHover={{ color: "#14B8A6", x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  GitHub Repository
                </motion.a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 text-center" style={{ borderTop: "1px solid var(--theme-border)" }}>
          <p style={{ color: "var(--theme-text-secondary)" }}>
            Copyright {new Date().getFullYear()} EduScrapeApp. Built for educators who deserve better tools.
          </p>
        </div>
      </div>
    </footer>
  );
}
