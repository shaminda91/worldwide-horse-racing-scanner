# EquiScan Global: Worldwide Horse Racing Results & Instant Camera Scanner

A mobile-first web application providing instant worldwide horse racing results, live track fixtures, and an AI-powered camera scanner that recognizes racecards, betting slips, and horse names from photos in real-time with bilingual support (Sinhala & English).

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during Phase 1 clarification:

- **Confirmed Decision 1 (Racing Coverage)**: Worldwide circuit coverage spanning the UK (Ascot, Cheltenham, Newmarket), US (Churchill Downs, Saratoga, Belmont), Australia (Flemington, Randwick), Dubai (Meydan), Hong Kong (Sha Tin, Happy Valley), and South Asia (Nuwara Eliya, Bangalore, Royal Western India Turf Club).
- **Confirmed Decision 2 (Language Interface)**: Full bilingual toggle (සිංහල / English) with instantaneous switching across all UI labels, race classifications, status indicators, and AI scan explanations.
- **Confirmed Decision 3 (Camera Scanning Engine)**: Multimodal AI scanner utilizing `gemini-3.8-flash` via server-side proxy to process user camera photos or uploaded race slips, extracting racecourse, race number, runner names, finishing positions, odds, and payouts with live search verification.

---

## 1. Overview & Core Concept

- **What It Does**: EquiScan Global allows turf enthusiasts, punters, and horse racing fans worldwide to instantly check live, recent, and upcoming horse race results. Users can either browse live global racecourses by region/date or point their mobile camera at any racecard, betting ticket, newspaper clipping, or horse name to get immediate verification, finishing order (1st, 2nd, 3rd, 4th), winning margins, dividends/odds, and jockey/trainer details.
- **Target Audience / Persona**: Mobile users and racing followers worldwide and in Sri Lanka who require fast race results without navigating complex foreign wagering portals, enhanced with native Sinhala translations and intuitive mobile touch controls.
- **Key Value**: Eliminates the delay and friction of finding foreign race results; a single camera snapshot or search query delivers instant, verified outcome data with odds, payouts, and race replays/notes.

---

## 2. User Experience & Visual Design

### Mobile Ergonomics & Visual Identity
- **Mobile-First Touch Ergonomics**: Adheres to the thumb-zone specification from the Mobile Touch Reference:
  - **Natural Reach Zone (Bottom 40%)**: Fixed bottom navigation bar with 4 primary destinations (Results / ප්‍රතිඵල, Instant Camera Scanner / කැමරා ස්කෑන්, Live Tracks / ධාවන පථ, Favorites / ප්‍රියතම).
  - **Stretch Zone (Middle 50%)**: Scrollable race cards, runner finish tables, track condition pill-free badges, and photo analysis results.
  - **Top Zone (10%)**: App bar with Region filter selector, Sinhala/English language toggle, and live search bar.
- **Aesthetic Direction**: Prestigious Turf Club aesthetic — deep emerald racecourse green canvas (`#0A1F16`), obsidian dark slate surfaces (`#111827`), brushed champion gold accents (`#EAB308` / `#F59E0B`), and crisp white high-contrast typography for outdoor daylight legibility.
- **Zero-Pill Discipline**: Statuses and metadata (e.g. `Ascot · Race 4 · 1m 2f · Turf · Good to Firm`) rendered with subtle typographic separators (`·`) rather than nested colored pill containers.
- **Camera Scanner HUD**:
  - Fullscreen camera viewfinder overlay with high-contrast target framing brackets, flash toggle, and photo library upload button.
  - Interactive test samples for quick testing (e.g. "Ascot Gold Cup Ticket", "Melbourne Cup Slip", "Sha Tin Hong Kong Card", "Churchill Downs Kentucky Derby").
  - Instant scan progress sheet displaying detected text, confidence, identified racecourse, and immediate finishing result.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Multimodal Gemini 3.8 Flash for Photo Scan & Result Lookup**
  - *Chosen Approach*: Send uploaded/captured images to a server-side endpoint running `gemini-3.8-flash`. Gemini extracts the horse name, racecourse, date, and race number, and cross-references against live racing records and web search results.
  - *Why*: Eliminates the need for multiple separate OCR libraries (Tesseract) while providing intelligent error-tolerant matching for damaged, angled, or low-light slips.
  - *Alternative Considered*: Client-side OCR + external paid horse racing API. (Rejected due to high API latency, lack of global unified coverage, and poor accuracy on handwriting or wrinkled betting slips).
- **Decision 2: Comprehensive Global Seed Data with Live Simulation & Real Search Grounding**
  - *Chosen Approach*: Rich offline/instant database of premier worldwide races across the UK, USA, Australia, Dubai, Hong Kong, and Sri Lanka (Nuwara Eliya) with live search augmentation when scanning arbitrary custom tickets.
  - *Why*: Delivers sub-200ms instantaneous results for all standard global fixtures while preserving full dynamic lookup capability for any race slip uploaded by the user.
- **Decision 3: Bilingual Context System**
  - *Chosen Approach*: First-class Sinhala and English dictionaries supporting immediate reactive re-rendering of all race vocabulary (e.g., "Win/Place", "ජයග්‍රාහී", "ධාවන පථය", "දිවීම් අංකය", "තත්ත්වය", "තරඟ ප්‍රතිඵල").
  - *Why*: Directly fulfills the user's explicit request with complete cultural accuracy and racing terminology.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    EquiScan Mobile Client                   │
│                                                             │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │ Live Racecards  │  │ Instant Cam HUD  │  │ Search &    │ │
│  │ & Results View  │  │ & Slip Analyzer  │  │ Region Bar  │ │
│  └────────┬────────┘  └────────┬─────────┘  └──────┬──────┘ │
│           │                    │                   │        │
│           └────────────────────┼───────────────────┘        │
│                                │                            │
│                 ┌──────────────┴─────────────┐              │
│                 │ Bilingual State & Storage  │              │
│                 │ (Sinhala / English Toggle) │              │
│                 └──────────────┬─────────────┘              │
└────────────────────────────────┼────────────────────────────┘
                                 │ HTTP POST /api/scan-ticket
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Vite / Express Server Middleware               │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ @google/genai Server Client                            │ │
│  │ Model: 'gemini-3.8-flash'                              │ │
│  │ Multimodal Image Vision + Racing Extraction Prompt     │ │
│  └────────────────────────┬───────────────────────────────┘ │
│                           ▼                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Structured JSON Output:                                │ │
│  │ { horseName, raceTrack, raceNumber, raceDate,          │ │
│  │   status, finishPosition, runners, odds, winPayout,   │ │
│  │   margin, jockey, trainer, notesSinhala, notesEnglish } │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Entities & Schema
- `RaceFixture`: `{ id, name, nameSi, track, trackSi, country, region, date, time, distance, surface, status: 'FINISHED' | 'LIVE' | 'UPCOMING', runners: Runner[] }`
- `Runner`: `{ number, horseName, horseNameSi, jockey, trainer, barrier, odds, finishPosition: number | null, margin: string, payout: string }`
- `ScanResult`: `{ detectedText, matchedHorse, matchedTrack, raceDate, finishPosition, didWin, odds, payout, summaryEn, summarySi, timestamp }`

---

## 5. Execution Steps
1. **Server-Side API Setup**: Implement `/api/scan-ticket` endpoint handling base64 images with `@google/genai` (`gemini-3.8-flash`).
2. **Worldwide Racing Database**: Seed realistic global fixture data covering Ascot, Cheltenham, Flemington, Churchill Downs, Meydan, Sha Tin, and Nuwara Eliya.
3. **Camera & Image Scan Component**: Build high-performance camera viewfinder (WebRTC `getUserMedia` with fallback photo upload and built-in racing slip presets).
4. **Bilingual UI & Localized Copy**: Implement seamless English and Sinhala toggle across all views.
5. **Interactive Results Explorer**: Implement live filters (Region, Status, Search, Date), runner finish breakdowns, and ticket verification history.
