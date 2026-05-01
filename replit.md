# IPFP Manager

An academic management portal for Institut Polytechnique de la Formation Professionnelle (IPFP). Built with React + Vite, using Firebase Firestore as the backend.

## Architecture

- **Frontend**: React 19 + Vite 8, JavaScript/JSX
- **Routing**: React Router DOM v7
- **Data layer**: Firebase Firestore (no traditional backend — all data ops via Firestore SDK)
- **UI**: Lucide React icons, Framer Motion animations, Recharts for charts
- **PDF export**: jsPDF
- **Tables**: TanStack React Table

## Project Structure

- `src/App.jsx` — top-level routing (public token routes + admin routes)
- `src/main.jsx` — app entry point
- `src/firebase.js` — Firebase/Firestore initialization
- `src/context/` — React contexts (AppContext, AdminAuthContext, ToastContext)
- `src/pages/` — route-level page components
- `src/components/` — reusable UI components
- `src/hooks/` — custom hooks (useTokenAuth, useTokenManagement)
- `src/utils/` — utility functions (tokenManager, pdfGenerator, logoBase64)
- `src/data/` — static data (modules.js)
- `src/layouts/` — layout shells (DashboardLayout)

## Key Features

- **Admin portal** (password-protected): manage students, teachers, modules, grades, attendance, schedules, finance, reports
- **Token-based public access**: students can view results, teachers can access their portal via revocable Firestore-stored tokens
- **PDF generation**: export reports as PDFs

## Development

- Package manager: npm
- Dev server: `npm run dev` (Vite on port 5000, host 0.0.0.0)
- Build: `npm run build`

## Deployment

- Configured as **static** deployment
- Build command: `npm run build`
- Public directory: `dist`
