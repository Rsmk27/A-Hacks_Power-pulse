# Firefighter Dashboard (Power Pulse)

Web monitoring dashboard for the Power Pulse firefighter safety system.

## Stack
- Framework: React 19
- Build tool: Vite 8
- Styling: Tailwind CSS 3 + PostCSS
- Realtime backend: Firebase Realtime Database
- Mapping: MapLibre GL
- Charts: Recharts
- Alerts: React Hot Toast

## Dependencies
### Runtime dependencies
- firebase
- leaflet
- maplibre-gl
- react
- react-dom
- react-hot-toast
- react-leaflet
- recharts

### Dev dependencies
- @vitejs/plugin-react
- eslint and related plugins
- tailwindcss
- postcss
- autoprefixer

## Scripts
- npm run dev: start development server
- npm run build: build production bundle
- npm run preview: preview production build
- npm run lint: run lint checks

## Environment and Data
- Reads firefighter telemetry from Firebase Realtime Database.
- Supports multiple firefighter IDs from the dashboard UI.
- Displays live values for temperature, humidity, gas level, fall detection, status, and GPS.

## Run Locally
1. Install dependencies:
	```bash
	npm install
	```
2. Start development server:
	```bash
	npm run dev
	```
3. Build production output:
	```bash
	npm run build
	```
