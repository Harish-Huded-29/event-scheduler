# App Flow — Event Scheduler

## Screen map

```
App launch
  └─ Bottom tabs: [Events] [Tasks] [Schedule]   (Events active by default)
                                                       ⌄
                                        Fixed + button, bottom-right
                                        (present on every tab)
                                                       │
                                        tap → menu expands:
                                        ┌───────────────────────┐
                                        │ + Add event            │
                                        │ + Add task              │
                                        │ + Add schedule entry    │
                                        └───────────────────────┘
```

## Events tab

```
[Month picker]
   │
   ▼
Table: # | Event name | Date | 🗑
   │                              │
   │ tap row                      │ tap 🗑
   ▼                              ▼
Detail dialog                Confirm → delete → table refreshes
(name, dates, location,
 remarks, added-on timestamp,
 Delete / Close)
```

## Tasks tab

```
Table: ◯ | Task name (+ priority dot) & due date | 🗑
  │                     │                            │
  │ tap ◯                │ tap row                    │ tap 🗑
  ▼                     ▼                            ▼
Toggle complete    Detail dialog                Confirm → delete
  │                (name, due, priority, notes,
  │                 alarm: on/off, calendar: on/off,
  │                 added-on timestamp, Delete / Mark done)
  ▼
If now complete:
  ├─ was "Set alarm" checked at creation? → cancel that reminder
  ├─ was "Add to calendar" checked at creation? → delete that calendar event
  └─ log "Completed: <task name>" into Schedule
```

### Add Task dialog

```
Name*  Due date*  Due time  Priority  Notes
[ ] Set alarm reminder
[ ] Add to calendar
        │
        ▼ on save
  create task record
  ├─ if alarm checked  → schedule native reminder → store alarmActive=true
  └─ if calendar checked → create calendar event  → store calendarActive=true
```

## Schedule tab

```
Table: # | Activity | Date | 🗑     (newest first)
   │                            │
   │ tap row                    │ tap 🗑
   ▼                            ▼
Detail dialog                Confirm → delete
(title, date, notes,
 added-on timestamp)

Entries arrive two ways:
  1. Manually, via + → Add schedule entry
  2. Automatically, whenever a task is marked complete
```

## Dialog / back-button behavior

```
Open any dialog → push a history entry
Android back button → pops the entry → closes the top dialog
                        (app itself is never exited by back)
Tap outside / Cancel / Close → same close path, keeps history in sync
```

## Data flow: storage

```
IndexedDB (device-only, no network)
 ├─ events    { id, name, startDate, endDate, location, remarks, createdAt }
 ├─ tasks     { id, name, dueDate, dueTime, priority, notes, status,
 │              alarmActive, calendarActive, calendarEventId, createdAt }
 └─ schedule  { id, title, date, notes, createdAt }
```

Every table read (e.g. "this month's events", "open tasks") queries only
the matching records via a date/status index — it never loads and
re-parses the entire dataset just to render one screen.
