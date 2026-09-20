# Tech Stack — Event Scheduler

## Core app (what actually renders the UI)
- **HTML5** — structure, semantic elements, native `<input type="date">`,
  `<input type="time">`, `<input type="month">` for zero-JS date pickers.
- **CSS3** — custom properties (`:root` variables) for the dark color
  system, flexbox for layout, no CSS framework needed (keeps the app tiny
  and offline-friendly).
- **Vanilla JavaScript (ES6+)** — no framework (React/Vue/etc. add build
  tooling and weight that this app doesn't need). Plain JS keeps it a
  single portable file and easy for any LLM/editor to regenerate in one
  pass.

## Storage (in-app, no server)
- **IndexedDB** — the browser/WebView's built-in structured database.
  Three object stores: `events`, `tasks`, `schedule`, each indexed by
  date. This is the "sheet-like" local database, done properly — records
  are queried individually instead of parsing one giant JSON blob on every
  read/write (which is what `localStorage` would force you into).

## Packaging into an installable Android app
- **Capacitor** (by Ionic) — wraps the HTML/CSS/JS as a native Android
  WebView project. Alternative: **Cordova** (older, same idea).
- **Android Studio + Gradle** — required once, to build/sign the APK that
  Capacitor generates.

## Native-feature plugins (only needed for real alarms/calendar events)
- **`@capacitor/local-notifications`** — schedule a reminder that fires
  even when the app is closed, and cancel it by id — this is what makes
  "turn off the alarm when the task is completed" actually work.
- **`@capacitor-community/calendar`** (or similar) — create a real device
  calendar event and get an id back, so it can be deleted later when the
  task is completed. Without a plugin like this, the web-only fallback is
  a `.ics` file export, which the user must remove manually since the app
  has no reference to it afterward.
- Both require Android runtime permissions (notifications, calendar) —
  request them the first time the user checks "Set alarm" / "Add to
  calendar".

## What's intentionally *not* used
- No backend server, no cloud database, no analytics SDK, no ad SDK.
- No external icon font/CDN — keep the app self-contained and lightweight;
  use inline SVG or plain Unicode glyphs for icons.
- No CSS/JS framework — not needed at this app's size, and it keeps the
  whole thing regenerable as one file by an LLM.

## Dev tools
- Any code editor (VS Code, Cursor, Android Studio's built-in editor).
- Chrome DevTools' "Application" tab to inspect IndexedDB while developing
  in a desktop browser before packaging.
