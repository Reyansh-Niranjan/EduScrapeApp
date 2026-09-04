# NovaSlate

<p align="center">
  <img alt="NovaSlate Web Banner" src="./public/novaslate_web_banner.svg" width="100%" />
</p>

<p align="center">
  <strong>Automated Educational Content Management &amp; Curriculum Delivery Platform for K–12 Education</strong>
</p>

<p align="center">
  <a href="https://github.com/Reyansh-Niranjan/novaslate/stargazers">
    <img src="https://img.shields.io/github/stars/Reyansh-Niranjan/novaslate?style=flat-square&color=141413&labelColor=09090B" alt="GitHub Stars" />
  </a>
  <a href="https://github.com/Reyansh-Niranjan/novaslate/issues">
    <img src="https://img.shields.io/github/issues/Reyansh-Niranjan/novaslate?style=flat-square&color=141413&labelColor=09090B" alt="Open Issues" />
  </a>
  <a href="https://github.com/Reyansh-Niranjan/novaslate/commits/main">
    <img src="https://img.shields.io/github/last-commit/Reyansh-Niranjan/novaslate?style=flat-square&color=141413&labelColor=09090B" alt="Last Commit" />
  </a>
  <a href="https://github.com/Reyansh-Niranjan/novaslate/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/Reyansh-Niranjan/novaslate/scrape_and_replenish.yml?label=pipeline&style=flat-square&color=141413&labelColor=09090B" alt="Scraper Pipeline CI" />
  </a>
  <a href="https://github.com/Reyansh-Niranjan/novaslate/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/Reyansh-Niranjan/novaslate?style=flat-square&color=141413&labelColor=09090B" alt="License" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-141413?style=flat-square&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-141413?style=flat-square&logo=typescript&logoColor=3178C6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-141413?style=flat-square&logo=tailwindcss&logoColor=06B6D4" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Backend-141413?style=flat-square&logo=supabase&logoColor=3ECF8E" alt="Supabase" />
  <img src="https://img.shields.io/badge/Python-3.11_Pipeline-141413?style=flat-square&logo=python&logoColor=3776AB" alt="Python Pipeline" />
  <img src="https://img.shields.io/badge/Atlas-ESP32_Hardware-141413?style=flat-square&logo=espressif&logoColor=E7352C" alt="Atlas Hardware" />
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#key-capabilities">Key Capabilities</a> •
  <a href="#system-architecture">Architecture</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#hardware-companion">Atlas Device</a> •
  <a href="#creator">Creator</a>
</p>

---

## Overview

**NovaSlate** is an automated educational content management and curriculum delivery platform designed for Indian K–12 schools, educators, and students. Instead of manually scouring dozens of websites for scattered textbooks and lesson resources, NovaSlate continuously indexes, grades readability, and organizes state board and NCERT curriculum materials into a unified digital library.

### Problems Solved
- ⏰ **Curriculum Discovery Grunt Work** — Automates resource finding and eliminates manual downloading.
- 📚 **Broken Structuring & Missing Taxonomies** — Automatically categorizes textbooks from Class 1 through Class 12.
- ⚡ **Bloated Downloads & Intrusive Watermarks** — Multi-engine compression and automated watermark removal deliver lightweight, distraction-free PDFs.
- 📡 **Offline & Low-Connectivity Resilience** — Companion **Atlas** hardware device caches curricula onto SD cards for rural environments.

---

## Key Capabilities

### 📖 Class 1–12 Digital Library
- **Structured Hierarchy:** Browse by grade level, subject taxonomy, and chapter streams.
- **In-Browser Reader:** Full-screen reader with zoom, keyboard navigation, and instant download.
- **Watermark Cleaned:** Processed PDFs stripped of visual artifacts for clean printing and study.

### ⚙️ Automated Ingestion & Compression Pipeline
- **Direct Catalog Parser:** Fast, resilient extraction directly from the NCERT portal without headless browser overhead.
- **Stream Watermark Removal:** PyMuPDF fingerprinting automatically identifies and strips recurring watermarks.
- **Vector-Preserving Optimization:** Downsamples raster assets and coalesces stream dictionaries (`pdfEasyCompress`, `pdfsizeopt`) while keeping vector text 100% sharp.

### 📝 Integrated Study Hub & Exam Preparation
- **Board PYQs & Practice:** Dedicated repository of past-year question papers (PYQs) and interactive MCQ quizzes categorized by grade and subject.
- **Visual Learning & Revision:** Chapter mindmaps, quick-reference flashcards, formula cheatsheets, and personalized study notes alongside textbook reading.

<a id="hardware-companion"></a>
### ⚡ Dual Ecosystem: Cloud + Embedded Hardware
- **Web Platform:** Cloud-orchestrated web application powered by Supabase Storage and PostgreSQL.
- **Atlas Device:** Autonomous ESP32 micro-device featuring an SD card reader and custom C++ display engine for classrooms without internet.

---

## System Architecture

```
NovaSlate
├── 🌐 Web Frontend (React 19, TypeScript, Tailwind CSS, Vite)
│   ├── Landing Page (Precision Minimalist Bento Grid)
│   ├── User Workspaces (Student, Teacher, Admin)
│   ├── In-Browser PDF Reader
│   └── Study Hub & Notes Workspace
│
├── ⚙️ Ingestion & Compression Pipeline (Python)
│   ├── Direct JS NCERT Catalog Parser
│   ├── Multi-Threaded Resilient Downloader
│   ├── Stream Watermark Stripper (PyMuPDF)
│   └── Multi-Engine PDF Optimizer (pdfEasyCompress, pdfsizeopt)
│
├── 📦 Content Delivery (Supabase Storage CDN)
│   ├── Class1/ through Class12/ (Optimized PDF archives)
│   └── structure.json & catalog.json
│
├── 🗄️ Backend Services (Supabase)
│   ├── JWT Authentication & User Profiles
│   ├── Row-Level Security (RLS)
│   └── Content Metadata & Activity Logs
│
└── 📟 Embedded Hardware (Atlas-Device)
    ├── ESP32 Dual-Core Microcontroller
    ├── Offline SD Card Storage Partition
    └── Low-Memory C++ Rendering Engine
```

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend UI** | React 19, TypeScript, Tailwind CSS, Radix UI Primitives, Lucide Icons, Framer Motion, GSAP |
| **Typography** | Geist Sans, Geist Mono, Instrument Serif |
| **Backend & DB** | Supabase (PostgreSQL, Auth, RLS) |
| **Storage & CDN** | Supabase Storage Content Delivery |
| **Data & Compression** | Python 3.11, PyMuPDF, Pillow, pdfsizeopt, cpdfsqueeze |
| **Hardware** | Atlas (ESP32, C++, MicroSD FAT32) |

---

## Contributors

<p align="center">
  <a href="https://github.com/Reyansh-Niranjan/novaslate/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/Reyansh-Niranjan/novaslate?style=flat-square&color=141413&labelColor=09090B" alt="NovaSlate Contributors" />
  </a>
</p>

---

## Creator

**Reyansh Niranjan** — Creator, Architect & Lead Developer (Web Platform, Scraper Pipeline & Atlas ESP32 Offline Device).

---

## License

Distributed under the project license. See [LICENSE](LICENSE) for more information.
