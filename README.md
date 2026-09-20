# 📱 Event Scheduler — Standalone Android Application

An offline-first, full-featured **Android Application** for event scheduling, task management, and precise reminder alarms. Built as a standalone native Android package (`.apk` / `.aab`) featuring deep Android system integration, high-priority background alarm channels, DND (Do Not Disturb) bypass, device vibration haptics, and a luxury *Gold & Onyx* dark interface.

---

## 🌟 App Overview & Key Capabilities

- 📱 **Complete Standalone Android App**: Installs directly onto any Android phone or tablet as a native app with zero external server dependencies.
- ⏰ **Native Android Alarm Clock & Reminders**:
  - Leverages Android's native `AlarmManager` and `NotificationManager`.
  - Wakes up the device even when the app is closed or the screen is locked (`WAKE_LOCK` + `USE_EXACT_ALARM`).
  - High-priority notification channel (`alarm_channel`) configured to bypass Do Not Disturb with persistent sound and vibration patterns.
- 🔔 **Built-in Melodic Alarm Chimes**: Includes 5 synthesized alarm tones (*Golden Chime, Digital Pulse, Radiant Sunrise, Cosmic Marimba, Zen Harmony*) that play live and loop during alerts.
- ⏱️ **Circular Time & Custom Date Pickers**: Interactive 12-hour circular clock dial with AM/PM toggle and multi-year calendar selector built specifically for smooth mobile touch control.
- ✅ **Task Manager & Activity Log**: Priority-based task tracking, completion actions, and automatic logging into the chronological schedule table.
- 💾 **100% On-Device Storage**: Private, instant, and reliable IndexedDB storage engine embedded directly in the app.

---

## 🏗️ Android Architecture & Tech Stack

- **Android Target**: Android 8.0 (API 26) through Android 14+ (API 34+)
- **Native Runtime**: Java / Capacitor Android Engine (`com.immortal.eventscheduler`)
- **Native Activity**: [`MainActivity.java`](file:///d:/my%20shedule%20manager%20new/android/app/src/main/java/com/immortal/eventscheduler/MainActivity.java) (Manages notification channels, exact alarm permissions, and audio stream routing)
- **UI Framework**: React 19 + ES6+ Javascript + Custom CSS Design System
- **Build Tooling**: Gradle Wrapper (`gradlew`), Vite 8

---

## 📋 Prerequisites for Building the APK

To build the APK from source, ensure you have:

1. **Java JDK 17 or JDK 21**: Required by Gradle for compiling Android apps ([Download Eclipse Temurin](https://adoptium.net/))
2. **Node.js**: `v18.x` or `v20.x+` ([Download Node.js](https://nodejs.org/))
3. **Android SDK / Android Studio** (Recommended for USB debugging and emulators): [Download Android Studio](https://developer.android.com/studio)
4. **Git**: [Download Git](https://git-scm.com/)

---

## 🚀 Complete Step-by-Step Build & Installation Guide

### Step 1: Clone the Repository
```bash
git clone https://github.com/Harish-Huded-29/event-scheduler.git
cd event-scheduler
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Compile App Assets & Sync to Android
Build the application bundle and synchronize all native Android plugins:
```bash
npm run cap:sync
```
*(This runs `vite build` followed by `npx cap sync android`)*

---

## 📦 Generating the Android APK

You can generate the installable Android APK directly from your terminal using Gradle:

### On Windows (PowerShell / Command Prompt):
```powershell
cd android
.\gradlew.bat assembleDebug
```

### On macOS / Linux:
```bash
cd android
chmod +x gradlew
./gradlew assembleDebug
```

---

### 📍 APK File Location
Once the Gradle build finishes with `BUILD SUCCESSFUL`, your APK will be ready at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

### 📲 Installing the APK on Your Android Device

#### Option A: Direct USB Installation via ADB
Connect your phone with **USB Debugging** enabled:
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

#### Option B: Transfer File
Copy `app-debug.apk` directly to your phone via USB / WhatsApp / Drive / Telegram, open the file, and tap **Install**.

---

## 🛠️ Building a Production / Release APK

To create an optimized release build:
```powershell
cd android
.\gradlew.bat assembleRelease
```
The unsigned release package will be generated at:
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## 🖥️ Opening the Project in Android Studio

If you prefer using the Android Studio IDE:
```bash
npm run open
```
*(Or run `npx cap open android`)*

In Android Studio:
1. Wait for Gradle to finish indexing.
2. Select your device or emulator in the toolbar.
3. Click the **Run ▶** button to install and run the app live.

---

## ⚙️ Native Android Permissions Configured

Declared in `android/app/src/main/AndroidManifest.xml`:
| Permission | Purpose |
| :--- | :--- |
| `SCHEDULE_EXACT_ALARM` / `USE_EXACT_ALARM` | Ensures alarm notifications ring precisely on time even in Doze mode |
| `POST_NOTIFICATIONS` | Allows notification banners and alarm sounds on Android 13+ |
| `VIBRATE` | Drives physical device vibration motors for ringing alarms |
| `WAKE_LOCK` | Illuminates screen and sounds alarms when device is locked |

---

## 📁 Repository Structure

```
event-scheduler/
├── android/                     # Native Android project
│   ├── app/                     # Android app module
│   │   ├── build.gradle         # Android build configurations & SDK levels
│   │   └── src/main/
│   │       ├── AndroidManifest.xml # Permissions & Application metadata
│   │       ├── java/            # Native Java Activity & Channel config
│   │       └── res/             # App icons, splash screens & audio resources
│   ├── build.gradle
│   ├── gradlew.bat              # Windows Gradle wrapper script
│   └── gradlew                  # Unix Gradle wrapper script
├── assets/                      # Raw icons, audio presets & media
├── src/                         # Application logic & UI
│   ├── components/              # Views, dialogs, custom circular clock & calendar
│   ├── services/                # Native bridge, audio synthesizer, IndexedDB
│   └── styles/                  # Theme & component styling
├── capacitor.config.json        # Capacitor native bridge configuration
├── package.json                 # Project dependencies & build scripts
├── vite.config.js               # Bundler configuration
└── README.md                    # App documentation
```

---

## 📜 Available NPM Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs live preview server for quick UI testing |
| `npm run build` | Compiles production assets into `dist/` |
| `npm run cap:sync` | Builds assets and syncs to native Android project |
| `npm run open` | Opens native project directly in Android Studio |

---

## 📄 License

This project is licensed under the **MIT License**.
