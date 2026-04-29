# UI Replay

A developer tool that records user interactions on a web page and replays them with an insights engine. Built as a single-page Next.js app with a polished, dark developer-tool aesthetic.

## Features

- **Recording** — captures throttled mouse movement (~30fps), clicks (with element bounds), scroll positions, and input field changes, all timestamped against a session start time.
- **Replay** — animated cursor with smooth interpolation between sample points, click ripples, target-element glow, scroll restoration, and progressive input typing.
- **Timeline** — scrubbable bar with click markers, gradient progress fill, and a draggable playhead.
- **Playback controls** — play / pause / restart, plus 1× and 2× speed.
- **Insights** — heatmap of click density, top-vs-bottom interaction distribution, time-to-first-action, longest idle, repeated-click clusters, and cursor travel distance.
- **Session library** — sidebar with all stored sessions, durations, event counts, and per-session deletion.

## Running

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), press **Start recording**, interact with the workspace, then **Stop & save**. You'll be redirected to the replay view.

## Stack

- Next.js 14 (App Router) + React 18
- Tailwind CSS for styling
- Next.js API routes for the backend
- JSON file storage at `data/sessions.json` (created on first save, gitignored)

No external recording / replay libraries are used.

## Project layout

```
app/
  page.js             - record screen
  replay/page.js      - replay screen (Suspense wrapper)
  api/sessions/       - GET list / POST create / GET one / DELETE
  layout.js, globals.css

components/
  Recorder.jsx        - record UI + Start / Stop controls
  ReplayPage.jsx      - 3-column replay layout
  ReplayCanvas.jsx    - canvas with cursor, ripples, scroll, inputs
  DemoWorkspace.jsx   - the page being recorded (also rendered read-only during replay)
  Timeline.jsx        - scrub bar with click marks
  PlaybackControls.jsx
  InsightsPanel.jsx   - heatmap, distribution, timing, repeated clicks
  SessionList.jsx     - left sidebar
  CustomCursor.jsx    - SVG cursor with optional click pulse

hooks/
  useRecorder.js      - throttled event capture
  useReplay.js        - rAF loop, binary-search per-frame state

lib/
  db.js               - JSON file storage
  insights.js         - heatmap + repeated-click clustering + timing
  utils.js            - formatters and binary search
```

## Design notes

- **Coordinates** are stored relative to the workspace's bounding box at record time. On replay they're scaled to the current canvas size, so the replay survives resize.
- **Per-frame state** is computed by binary-searching the event arrays at the current playhead time. Refs + a shallow-equal check avoid React re-renders when nothing changed.
- **Mouse moves** are throttled to one sample per ~33ms with a hard cap at 50,000 events per session.
- **Scope**: the replay reproduces the recorded user input — cursor, clicks, scroll, and typed text — over the same demo component, not arbitrary DOM mutations on a live page. A general-purpose recorder would also need DOM snapshotting (à la rrweb), which is out of scope here.

## Storage

Sessions live in `data/sessions.json` as a flat array, written via `lib/db.js`. There's no migration step — the file is created on first save and ignored by git.
