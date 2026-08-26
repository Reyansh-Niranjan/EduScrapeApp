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
- User profile with grade configuration and onboarding

**Technical stack:**
- Frontend: React 19 + TypeScript + Tailwind CSS 3 + Vite
- Auth & data: Supabase
- Content delivery: Firebase Hosting
- AI: OpenRouter API (tool-calling + writer model flow), Gemini 2.0 Flash for vision
- Icons: Lucide React
- Typography: Geist Sans & Geist Mono (Utilitarian Minimalist Editorial)
- Deploy targets: Netlify, Vercel

**Creator & Governance:**
- Independent project created and engineered solely by **Reyansh Niranjan**.
- Not affiliated with CPX-SE.

## Brand Commitments

- Name "EduScrapeApp" and vector monogram logo.
- Premium utilitarian minimalism: warm monochrome palette, crisp 1px borders, muted pastels, zero AI-slop gradients.

## Evidence on Hand

- Working deployed application with live content on Firebase.
- Python scraper pipeline (`scraper/`) for content ingestion: catalog builder, downloader, watermark remover, Supabase uploader.
- Solo engineer & creator: Reyansh Niranjan.

## Product Principles

1. **Instant access wins** — A student should go from opening the app to reading their textbook in the fewest possible steps.
2. **Connectivity is not assumed** — Design for mixed connectivity; offline-capable delivery is a real product line, not an afterthought.
3. **Curation over aggregation** — Quality grading and curriculum alignment distinguish this from a raw file dump.
4. **Student-first, educator-supported** — The primary experience serves students; teacher and admin surfaces exist to support that mission.
5. **Automation removes grunt work** — The scraping pipeline replaces hours of manual searching; the AI assistant replaces hours of manual navigation.
6. **Utilitarian Minimalism** — Clean, document-style interface without noisy marketing gradients or generic visual filler.

## Accessibility & Inclusion

Mixed-connectivity audience includes students in rural India with limited internet. The companion ESP32 device addresses offline access. Web accessibility standards (keyboard nav, screen readers, sufficient contrast) are maintained.
