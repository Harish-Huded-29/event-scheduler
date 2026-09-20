# 📅 Event Scheduler & Task Manager (Android & Web)

A high-performance, offline-first Event Scheduler and Task Management application built with **React 19**, **Vite**, **IndexedDB**, and **Capacitor 8** for Android. Designed with a luxury dark theme (*Gold & Onyx*), custom circular clock dial, custom date pickers, real-time Web Audio alarm chimes, and native Android high-priority notifications.

---

## ✨ Features

- 🕒 **Event Management**: Create and filter multi-day events with month and year views.
- ✅ **Task Manager**: Organize tasks with priority indicators (Low, Medium, High), due dates, and completion toggles.
- 📋 **Schedule & Activity Log**: Chronological tabular view of all scheduled activities and completed task logs.
- ⏰ **Native Android Alarm Integration**: Background and lockscreen alarm clock reminders using Android `AlarmManager` and Capacitor Local Notifications with DND bypass.
- 🔔 **Custom Alarm Ringtones**: 5 synthesized harmonic tones (*Golden Chime, Digital Pulse, Radiant Sunrise, Cosmic Marimba, Zen Harmony*) powered by Web Audio API.
- ⏱️ **Interactive Circular Time Picker & Date Picker**: Custom-built touch and mouse-responsive circular 12-hour clock dial and month/year calendar picker.
- 🔒 **100% Offline & Private**: Zero cloud dependency. All data is stored locally on the device using IndexedDB.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, JavaScript (ES6+), Vanilla CSS (Custom Design System)
- **Bundler**: Vite 8
- **Database**: IndexedDB (Native browser / WebView local storage)
- **Audio Engine**: Web Audio API (Tone Synthesizer)
- **Mobile Runtime**: Capacitor 8 (Android)
- **Native Android**: Java (JDK 17), Android SDK (API 34+), Gradle

---

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed on your system:

1. **Node.js**: `v18.x` or `v20.x+` ([Download Node.js](https://nodejs.org/))
2. **Java Development Kit (JDK)**: JDK 17 or JDK 21 ([Download Eclipse Temurin / Oracle JDK](https://adoptium.net/))
3. **Android Studio** (Optional for CLI builds, recommended for emulation & debugging): [Download Android Studio](https://developer.android.com/studio)
4. **Git**: [Download Git](https://git-scm.com/)

*(Optional)* If you use Python for local scripts or virtual environments:
- **Python**: `3.10+`

---

## 🚀 Step-by-Step Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Harish-Huded-29/event-scheduler.git
cd event-scheduler
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Local Development Server
To run and test the web app in your browser:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

---

## 📱 Building the Android APK

### Step 1: Build the Web Distribution Bundle
Compile the React source files into the production `dist/` folder:
```bash
npm run build
```

### Step 2: Sync Web Assets to Android Project
Copy the `dist/` bundle and update native Capacitor plugins:
```bash
npx cap sync android
```
*(Or use the shortcut script):*
```bash
npm run cap:sync
```

---

### Step 3: Build APK via Command Line (Gradle)

You can build the debug APK directly from the terminal without opening Android Studio:

#### On Windows (PowerShell / Command Prompt):
```powershell
cd android
.\gradlew.bat assembleDebug
```

#### On macOS / Linux:
```bash
cd android
chmod +x gradlew
./gradlew assembleDebug
```

#### 📦 APK Output Location:
Once the Gradle build succeeds, your APK will be generated at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

### Step 4: Build a Release / Signed APK (Optional)

To build an unsigned release APK:
```powershell
cd android
.\gradlew.bat assembleRelease
```
The output file will be generated at:
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## 🖥️ Opening in Android Studio

If you prefer using Android Studio for live debugging, running on physical USB devices, or creating signed bundles (`.aab` / `.apk`):

```bash
npx cap open android
```
*(Or use `npm run open`)*

In Android Studio:
1. Let Gradle sync and index dependencies.
2. Click the **Run ▶** button or go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## 📁 Project Structure

```
event-scheduler/
├── android/                     # Android native project & Gradle wrappers
│   ├── app/                     # Android app module (Java, Manifest, Res)
│   │   └── src/main/java/com/immortal/eventscheduler/MainActivity.java
│   ├── build.gradle
│   ├── gradlew.bat              # Windows Gradle wrapper
│   └── gradlew                  # Unix Gradle wrapper
├── assets/                      # Icons, sounds, and media resources
├── dist/                        # Production web bundle output (generated)
├── src/
│   ├── components/
│   │   ├── common/              # Toast notification container
│   │   ├── layout/              # Header, BottomNav, FloatingActionButton
│   │   ├── modals/              # Add/Edit Task, Schedule, Event, Alarm Ringing
│   │   ├── pickers/             # CircularTimePicker, CustomDatePicker, SoundPicker
│   │   └── views/               # TasksView, ScheduleView, EventsView
│   ├── services/
│   │   ├── audioEngine.js       # Web Audio API tone synthesizer
│   │   ├── db.js                # IndexedDB database layer
│   │   ├── formatters.js        # Date/time formatting helpers
│   │   └── nativeBridge.js      # Capacitor & native platform bridge
│   ├── styles/
│   │   ├── main.css             # Component styling
│   │   └── theme.css            # Dark luxury color tokens & variables
│   ├── App.jsx                  # Main application component
│   └── main.jsx                 # React root entry point
├── capacitor.config.json        # Capacitor configuration
├── index.html                   # HTML entry point
├── package.json                 # Project dependencies & scripts
├── vite.config.js               # Vite configuration
└── README.md                    # Project documentation
```

---

## ⚙️ Capacitor & Android Permissions

The app includes required permissions in `android/app/src/main/AndroidManifest.xml`:
- `android.permission.SCHEDULE_EXACT_ALARM` / `USE_EXACT_ALARM` — For precise, reliable alarm reminders.
- `android.permission.POST_NOTIFICATIONS` — High-priority notification banner & sound on Android 13+.
- `android.permission.VIBRATE` — Haptic feedback when alarms ring.
- `android.permission.WAKE_LOCK` — Wakes screen when reminder triggers.

---

## 📜 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server on port 3000 |
| `npm run build` | Compiles production assets into `dist/` |
| `npm run preview` | Previews the production build locally |
| `npm run cap:sync` | Builds web assets and synchronizes Android native folder |
| `npm run open` | Launches Android Studio with the Android project |

---

## 📄 License

This project is licensed under the **MIT License**.
