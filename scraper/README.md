# 📚 NCERT Scraper & Multi-Engine Compression Pipeline

A high-performance, resilient NCERT textbook extraction, deep PDF size optimization, and cloud synchronization engine designed for **NovaSlate**.

---

## ⚡ Key Highlights

- **Multi-Engine PDF Optimization**: Integrates best-in-class techniques from three open-source compression projects:
  - **[pdfEasyCompress](https://github.com/davidAlgis/pdfEasyCompress)**: In-stream scan image downsampling and re-encoding with Pillow, alpha channel white-background blending, with **100% preservation of vector text, fonts, and searchability**.
  - **[pdfsizeopt](https://github.com/pts/pdfsizeopt)**: Deep stream deflation (`FlateDecode`), XObject garbage collection (`garbage=4`), and content-hash image deduplication.
  - **[cpdfsqueeze](https://github.com/coherentgraphics/cpdfsqueeze-binaries)**: Structural object squeezing, dictionary coalescing, and binary auto-detection with pure-Python fallback.
- **Direct JS Parser (Zero Headless Overhead)**: Extracts the full Class 1–12 textbook catalog directly from NCERT's `change1()` script without slow, flaky browser automation.
- **Resilient Downloader**: Concurrent multi-threaded downloading with HTTP `Range` resume support, exponential backoff, CRC verification, and rapid `HEAD` size probing.
- **Automated Watermark Removal**: Uses PyMuPDF stream fingerprinting (`watermark_remover.py`) to detect and strip recurring NCERT watermark image objects across every page.
- **Smart PDF Assembly**: Unpacks official NCERT chapter ZIPs, orders prelims/cover pages first, and merges chapters into clean, searchable, single-book PDFs.
- **Supabase Storage Sync**: Automatically uploads PDFs into the `ncert` bucket formatted cleanly as `Class <N>/<Subject>/<Book Title>.pdf` with duplicate detection and catalog syncing.
- **Automated GitHub Actions**: Scheduled monthly workflow (`.github/workflows/scrape_and_replenish.yml`) and manual `workflow_dispatch` trigger.

---

## 🚀 Local Usage

### 1. Installation

```bash
cd scraper
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` in the root or `scraper/` folder (or use existing `.env.local`):

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
```

### 3. CLI Commands

```bash
# Preview books without downloading (dry run)
python scraper/main.py --class 10 --dry-run

# Download all Class 10 books with automated multi-pass compression
python scraper/main.py --class 10

# Download a specific subject with custom DPI and JPEG quality
python scraper/main.py --class 12 --subject Physics --dpi 130 --quality 70

# Download & directly sync to Supabase bucket 'ncert'
python scraper/main.py --class 10 --upload-to-supabase --clean-local

# Run complete Class 1-12 catalog sync with 8 concurrent workers
python scraper/main.py --class all --upload-to-supabase --clean-local --concurrency 8

# Standalone PDF Optimizer CLI (test or compress any individual PDF)
python scraper/optimizer.py input.pdf output.pdf --dpi 140 --quality 75
```


---

## 🤖 GitHub Actions Setup

To enable automated textbook replenishment in your GitHub repository:

1. Go to your GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Add the following repository secrets:
   - `SUPABASE_URL`: Your Supabase Project URL (e.g. `https://xyz.supabase.co`).
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase `service_role` secret key (found in Supabase Dashboard under Project Settings -> API).
3. Under the **Actions** tab on GitHub, you can now trigger the **"NCERT Scraper & Supabase Replenish"** workflow manually or let it run automatically on its monthly schedule.
