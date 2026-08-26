# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** Indian K-12 students (Class 1–12) who need organized, accessible textbooks and educational materials for their specific grade and subject.

**Secondary:** Teachers and tutoring-center educators who browse cross-grade content, download materials for classroom use, and track platform updates.

**Tertiary:** Administrators who manage content, user accounts, and platform announcements.

## Product Purpose

EduScrapeApp is an automated curriculum curation platform. It scrapes, grades, organizes, and delivers educational resources so students and educators can access quality materials from a single place instead of hunting across dozens of websites. Success means a student can find, open, and study their textbook in seconds — on any device, even with limited connectivity.

## Positioning

The full end-to-end pipeline: automated scraping → readability grading → curriculum-aligned curation → instant delivery → optional offline ESP32 device. No competing platform covers the entire chain from raw web content to an offline hardware reader.

## Operating Context

- Students sign in, set their grade, then browse a grade → subject → chapter hierarchy to open ZIP-hosted PDF textbooks.
- Teachers access the same library across all grades and download materials.
- Admins manage content, user accounts, and publish announcements from an admin panel.
- An AI assistant (with vision-powered Deep Visual Search) helps students navigate the library and understand textbook content including diagrams.
- Content is hosted on Firebase (`eduscrape-host.web.app`) as ZIP archives containing PDFs.
- A companion ESP32 device downloads and stores resources on an SD card for offline access in low-connectivity areas.

## Capabilities and Constraints

**Confirmed capabilities:**
- Grade-based digital library (Class 1–12) with subject hierarchy
- In-browser PDF viewer with navigation, zoom, and download
- AI chatbot assistant with tool-calling, web search, and Gemini 2.0 Flash vision model
- Role-based access (Student, Teacher, Admin)
- Dark/light theme toggle
- Admin panel with content management, team management, and GitHub-synced updates
- User profile with grade configuration and onboarding

**Technical stack:**
- Frontend: React 19 + TypeScript + Tailwind CSS 3 + Vite
- Auth & data: Supabase (migrated from Convex)
- Content delivery: Firebase Hosting
- AI: OpenRouter API (tool-calling + writer model flow), Gemini 2.0 Flash for vision
- Icons: Lucide React
- Animations: Framer Motion
- Analytics: Vercel Analytics
- Deploy targets: Netlify, Vercel

**Undecided:**
- Product name and logo are not locked — open to rebranding.

## Brand Commitments

- Part of the **CPX-SE** initiative.
- Name "EduScrapeApp" and current logo (`public/logo.svg`) are in use but explicitly not locked.
- No fixed brand guidelines, voice, or palette constraints.

## Evidence on Hand

- Working deployed application with live content on Firebase.
- Python scraper pipeline (`scraper/`) for content ingestion: catalog builder, downloader, watermark remover, Supabase uploader.
- Team of 7 (Reyansh Niranjan, Jeebika Choudary, Anshita Mohanty, Shreya Kar, Sai Sradha Ray, Riya Sakshi, Nirlipta Sahoo).
- No user testimonials, press coverage, or external benchmarks currently available — future work must not fabricate these.

## Product Principles

1. **Instant access wins** — A student should go from opening the app to reading their textbook in the fewest possible steps.
2. **Connectivity is not assumed** — Design for mixed connectivity; offline-capable delivery is a real product line, not an afterthought.
3. **Curation over aggregation** — Quality grading and curriculum alignment distinguish this from a raw file dump.
4. **Student-first, educator-supported** — The primary experience serves students; teacher and admin surfaces exist to support that mission.
5. **Automation removes grunt work** — The scraping pipeline replaces hours of manual searching; the AI assistant replaces hours of manual navigation.

## Accessibility & Inclusion

Mixed-connectivity audience includes students in rural India with limited internet. The companion ESP32 device addresses offline access. Web accessibility standards (keyboard nav, screen readers, sufficient contrast) should be maintained but no specific WCAG level has been formally committed.
