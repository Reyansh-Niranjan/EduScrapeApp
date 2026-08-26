# EduScrapeApp

<p align="center">
  <img src="./public/logo.svg" alt="EduScrapeApp Logo" width="80" height="80" />
</p>

<p align="center">
  <strong>Automated Curriculum Curation Platform for K–12 Education</strong>
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#key-capabilities">Key Capabilities</a> •
  <a href="#system-architecture">Architecture</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#the-team">Team</a> •
  <a href="#hardware-companion">ESP32 Device</a>
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

## Creator

**Reyansh Niranjan** — Creator, Architect & Lead Developer (Web Platform, Scraper Pipeline & ESP32 Offline Device).

---

## License

All rights reserved.

