# Event Scheduler • By IMMORTAL

> **Fast, distraction-free 100% Offline Android Event Scheduler** with local file management and an obsidian monochromatic luxury design.

[![Website](https://img.shields.io/badge/Live%20Showcase%20%26%20Download-event--s.vercel.app-white?style=for-the-badge&logo=vercel)](https://event-s.vercel.app)
[![Platform](https://img.shields.io/badge/Platform-Android-black?style=for-the-badge&logo=android)](https://event-s.vercel.app)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Offline-success?style=for-the-badge)](https://event-s.vercel.app)

---

## 📲 Download APK

Access and download the latest standalone Android APK directly from our official showcase website:

🔗 **[https://event-s.vercel.app](https://event-s.vercel.app)**

---

## ✨ Features

- **Pure Offline Architecture**: 100% offline. Zero telemetry, no cloud servers, and no accounts required. All event records and attachments remain strictly on your physical device.
- **Physical Device Document Storage**:
  - All files attached to events are stored directly in `/Internal Storage/Documents/EventSchedule/`.
  - Open, manage, or backup attachments anytime directly through your device file manager.
- **Sculpted Date Stamps**: High-visibility calendar badges on every event card displaying Month, large bold Day numbers (or multi-day ranges `22 → 25`), and Year for instant scannability.
- **Multi-Format Attachments**:
  - Attach up to **10 files per event**, up to **10 MB per file**.
  - Supports Images (PNG, JPG, WebP, GIF, SVG), PDFs, Documents (DOC, DOCX, XLS, XLSX, PPTX, TXT), Videos (MP4), and Audio recordings.
- **In-App Media & Native PDF Reader**:
  - High-fidelity full-screen image and photo lightbox viewer.
  - Seamless native device viewer integration for PDFs and office documents with automatic Back button return.
- **Self-Healing Storage & Safe Cleanup**:
  - If the `EventSchedule` folder is deleted from file manager, the app automatically recreates it on the next save.
  - Deleting an event prompts for confirmation and cleans up linked physical files to prevent storage leaks.
- **Monochromatic Obsidian Luxury UI**: High-contrast Black & White aesthetic, fluid micro-interactions, custom date pickers with 12-year window pagination, and responsive mobile ergonomics.

---

## 🛠️ Project Structure

```
├── android/            # Native Android Capacitor Project (Gradle)
├── src/                # React application source code
│   ├── components/     # Layout, Modals, Pickers, Views
│   ├── services/       # LocalStorageManager, DB, NativeBridge
│   ├── styles/         # Monochromatic design system (main.css, theme.css)
│   └── utils/          # Date formatters, Back button stack manager
├── website/            # Standalone Vercel showcase website & APK distribution
└── README.md           # Documentation
```

---

## 🚀 Development & Build Instructions

### Prerequisites
- Node.js (v18+)
- Java JDK 17+
- Android SDK & Build Tools

### Running the App Locally
```bash
# Install dependencies
npm install

# Start development dev server
npm run dev
```

### Building the Android APK
```bash
# Build React web bundle and sync with Capacitor
npm run build
npx cap sync android

# Compile debug APK via Gradle
cd android
./gradlew assembleDebug
cd ..
```
The compiled APK will be generated at `android/app/build/outputs/apk/debug/app-debug.apk` and copied to `EventScheduler.apk`.

### Building the Showcase Website
```bash
cd website
npm install
npm run build
```

---

## 📄 License & Credits

Developed with precision by **IMMORTAL**.
Direct live APK access: **[event-s.vercel.app](https://event-s.vercel.app)**
