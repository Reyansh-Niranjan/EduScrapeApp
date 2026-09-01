# EduScrapeApp

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/header/graph.svg?title=EduScrapeApp&subtitle=Automated+Curriculum+Curation+Platform+for+K%E2%80%9312&mode=dark&theme=cyan" />
    <img alt="EduScrapeApp Banner" src="https://shieldcn.dev/header/graph.svg?title=EduScrapeApp&subtitle=Automated+Curriculum+Curation+Platform+for+K%E2%80%9312&mode=light&theme=cyan" />
  </picture>
</p>

<p align="center">
  <strong>Automated Educational Content Management & Curriculum Delivery Platform for K–12 Education</strong>
</p>

<p align="center">
  <a href="https://github.com/Reyansh-Niranjan/EduScrapeApp/stargazers">
    <img src="https://shieldcn.dev/github/stars/Reyansh-Niranjan/EduScrapeApp.svg?variant=secondary" alt="GitHub Stars" />
  </a>
  <a href="https://github.com/Reyansh-Niranjan/EduScrapeApp/issues">
    <img src="https://shieldcn.dev/github/issues/Reyansh-Niranjan/EduScrapeApp.svg?variant=secondary" alt="Open Issues" />
  </a>
  <a href="https://github.com/Reyansh-Niranjan/EduScrapeApp/commits/main">
    <img src="https://shieldcn.dev/github/last-commit/Reyansh-Niranjan/EduScrapeApp.svg?variant=secondary" alt="Last Commit" />
  </a>
  <a href="https://github.com/Reyansh-Niranjan/EduScrapeApp/actions">
    <img src="https://shieldcn.dev/github/ci/Reyansh-Niranjan/EduScrapeApp.svg?workflow=scrape_and_replenish.yml&label=pipeline&variant=secondary" alt="Scraper Pipeline CI" />
  </a>
  <a href="https://github.com/Reyansh-Niranjan/EduScrapeApp/blob/main/LICENSE">
    <img src="https://shieldcn.dev/github/license/Reyansh-Niranjan/EduScrapeApp.svg?variant=secondary" alt="License" />
  </a>
</p>

<p align="center">
  <img src="https://shieldcn.dev/badge/React-19-61DAFB.svg?logo=react&logoColor=61DAFB&variant=secondary" alt="React 19" />
  <img src="https://shieldcn.dev/badge/TypeScript-5.x-3178C6.svg?logo=typescript&logoColor=3178C6&variant=secondary" alt="TypeScript" />
  <img src="https://shieldcn.dev/badge/Tailwind_CSS-3.x-06B6D4.svg?logo=tailwindcss&logoColor=06B6D4&variant=secondary" alt="Tailwind CSS" />
  <img src="https://shieldcn.dev/badge/Supabase-Backend-3ECF8E.svg?logo=supabase&logoColor=3ECF8E&variant=secondary" alt="Supabase" />
  <img src="https://shieldcn.dev/badge/Gemini-2.0_Flash-8E75FF.svg?logo=google&logoColor=8E75FF&variant=secondary" alt="Gemini 2.0 Flash" />
  <img src="https://shieldcn.dev/badge/ESP32-Hardware-E7352C.svg?logo=espressif&logoColor=E7352C&variant=secondary" alt="ESP32" />
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#key-capabilities">Key Capabilities</a> •
  <a href="#system-architecture">Architecture</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#hardware-companion">ESP32 Device</a> •
  <a href="#creator">Creator</a>
</p>

---

## Overview

**EduScrapeApp** is an automated educational content management and curriculum delivery platform designed for Indian K–12 schools, educators, and students. Instead of manually scouring dozens of websites for scattered textbooks and lesson resources, EduScrapeApp continuously indexes, grades readability, and organizes state board and NCERT curriculum materials into a unified digital library.

### Problems Solved
- ⏰ **Curriculum Discovery Grunt Work** — Automates resource finding and eliminates manual downloading.
- 📚 **Broken Structuring & Missing Taxonomies** — Automatically categorizes textbooks from Class 1 through Class 12.
- 🔍 **Diagram & Visual Querying** — Multimodal vision AI understands equations, graphs, and textbook figures.
- 📡 **Offline & Low-Connectivity Resilience** — Companion ESP32 hardware device caches curricula onto SD cards for rural environments.

---

## Key Capabilities

### 📖 Class 1–12 Digital Library
- **Structured Hierarchy:** Browse by grade level, subject taxonomy, and chapter streams.
- **In-Browser Reader:** Full-screen reader with zoom, keyboard navigation, and instant download.
- **Watermark Cleaned:** Processed PDFs stripped of visual artifacts for clean printing and study.

### 🤖 AI Assistant & Deep Visual Search
- **Multimodal Vision:** Streams textbook pages directly to **Gemini 2.0 Flash** via OpenRouter for diagram explanation.
- **Context-Aware Assistance:** Helps students navigate topics directly aligned with their grade level.

<a id="hardware-companion"></a>
### ⚡ Dual Ecosystem: Cloud + Embedded Hardware
- **Web Platform:** Cloud-orchestrated web application powered by Supabase and Firebase Hosting.
- **EduScraper-Device:** Autonomous ESP32 micro-device featuring an SD card reader and custom C++ display engine for classrooms without internet.

---

## System Architecture

```
EduScrapeApp
├── 🌐 Web Frontend (React 19, TypeScript, Tailwind CSS, Vite)
│   ├── Landing Page (Precision Minimalist Bento Grid)
│   ├── User Workspaces (Student, Teacher, Admin)
│   ├── In-Browser PDF Reader
│   └── Vision AI Assistant
│
├── 📦 Content Delivery (Firebase Hosting)
│   └── https://eduscrape-host.web.app
│       ├── Class1/ through Class12/ (ZIP & PDF archives)
│       └── structure.json & zips.json
│
├── 🗄️ Backend Services (Supabase)
│   ├── JWT Authentication & User Profiles
│   ├── Row-Level Security (RLS)
│   └── Content Metadata & Activity Logs
│
└── 📟 Embedded Hardware (EduScraper-Device)
    ├── ESP32 Dual-Core Microcontroller
    ├── Offline SD Card Storage Partition
    └── Low-Memory C++ Rendering Engine
```

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend UI** | React 19, TypeScript, Tailwind CSS, Radix UI Primitives, Lucide Icons, Framer Motion |
| **Typography** | Geist Sans & Geist Mono |
| **Backend & DB** | Supabase (PostgreSQL, Auth, RLS) |
| **Storage & CDN** | Firebase Hosting Content Delivery |
| **AI Models** | Gemini 2.0 Flash (OpenRouter) |
| **Hardware** | ESP32, C++, MicroSD FAT32 |

---

## Contributors

<p align="center">
  <a href="https://github.com/Reyansh-Niranjan/EduScrapeApp/graphs/contributors">
    <img src="https://shieldcn.dev/contributors/Reyansh-Niranjan/EduScrapeApp.svg?preset=surface&theme=cyan" alt="EduScrapeApp Contributors" />
  </a>
</p>

---

## Creator

**Reyansh Niranjan** — Creator, Architect & Lead Developer (Web Platform, Scraper Pipeline & ESP32 Offline Device).

---

## License

Distributed under the project license. See [LICENSE](LICENSE) for more information.
