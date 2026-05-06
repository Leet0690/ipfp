# IPFP Manager

An academic management portal for Institut Polytechnique de la Formation Professionnelle (IPFP). Built with React + Vite, using Firebase Firestore as the backend.

## Run & Operate

- Dev server: `npm run dev` (Vite on port 5000, host 0.0.0.0)
- Build: `npm run build`
- Required env vars: `VITE_FIREBASE_*` (API key, project ID, etc.), `VITE_ADMIN_EMAIL`, `VITE_ADMIN_PASSWORD`, `VITE_DIRECTOR_PASSWORD`

## Stack

- **Frontend**: React 19 + Vite 8, JavaScript/JSX
- **Routing**: React Router DOM v7
- **Data layer**: Firebase Firestore (no traditional backend)
- **UI**: Lucide React icons, Framer Motion animations, Recharts for charts
- **PDF export**: jsPDF
- **Tables**: TanStack React Table
- **PWA**: vite-plugin-pwa (Workbox `generateSW`); icons in `public/pwa-192.png` & `public/pwa-512.png`

## Where things live

- `src/App.jsx` — top-level routing (public token routes + admin routes)
- `src/firebase.js` — Firebase/Firestore initialization
- `src/context/` — React contexts (AppContext, AdminAuthContext, ToastContext)
- `src/pages/` — route-level pages (`AdminDashboard`, `ScheduleManagement`, etc.)
- `src/components/` — reusable UI components
- `src/data/modules.js` — source of truth for FILIERES, MODULES_DATA
- `src/index.css` — design tokens and utility classes (glass-card, btn-modern, input-premium…)

## Architecture decisions

- All data (students, teachers, schedules, grades, attendance) lives in Firestore; AppContext is the single data layer
- Schedule sessions use `time: "HH:mm-HH:mm"` string format (parsed at render time via `parseTimeRange`)
- Token-based public access: revocable Firestore-stored tokens for student results and teacher portals
- Admin portal is password-protected via `AdminAuthContext`; no Firebase Auth used for admins
- All pages are lazy-loaded via `React.lazy()` + `Suspense`; vendor libs split into named chunks in `vite.config.js`
- Service worker precaches all static assets; Firestore API calls use `NetworkFirst` (5s timeout) for offline resilience

## Product

- **Admin portal**: manage students, teachers, modules, grades, attendance, schedules, finance, reports
- **Schedule pages**: time-grid calendar view (Mon–Sat × 08:00–19:00) on both `/admin/schedules` (full-page with add/delete) and the dashboard widget (compact scrollable grid)
- **Token-based public access**: students can view results; teachers can view their portal
- **PDF generation**: export grade bulletins as PDFs

## User preferences

- Schedule design: Time-Grid (Google Calendar style), purple `#b068b9` for TP, amber `#fecd08` for Cours
- Sessions absolutely positioned by time on Y-axis, left-border accent, hover scale effect

## Gotchas

- `session.time` is a string `"08:30-10:30"` — split on `-` to get start/end for positioning
- Teachers are filtered by `groups` (filiere) and `years` when building the add-session dropdown
- Dashboard `ScheduleCalendar` uses `DASH_PX = 52` (compact); ScheduleManagement uses `PX_PER_HOUR = 64` (full-page)

## Pointers

- Design tokens: `src/index.css` (CSS vars like `--primary`, `--text-primary`, `--bg-subtle`, etc.)
- Mockup source: `artifacts/mockup-sandbox/src/components/mockups/schedule/TimeGrid.tsx`
