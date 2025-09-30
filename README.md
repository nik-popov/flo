# Flo shopper prototype

Flo is a location-aware ordering prototype that lets shoppers detect their current
location (or search manually), review nearby store inventories, and place orders
in a single interface. The project ships as a small full-stack app with an
Express API and a Vite + React frontend.

## Features

- Geolocation capture with graceful fallback to manual location search
- Store discovery with radius filtering and distance calculations
- Live inventory browsing with client-side search and availability indicators
- Cart management and order submission with server-side validation
- End-to-end test coverage (Jest for the API, Vitest + Testing Library for the UI)

## Tech stack

- **Backend:** Node.js, Express, Jest, Supertest
- **Frontend:** React 19, Vite, Testing Library, Vitest

## Getting started

### Prerequisites

- Node.js 18 or newer (bundled with npm)

### Install dependencies

```bash
# In one terminal
cd server
npm install

# In another terminal
cd ../frontend
npm install
```

### Run the development stack

```bash
# Terminal 1 – start the API on http://localhost:4000
cd server
npm run dev

# Terminal 2 – start the web client on http://localhost:5173
cd frontend
npm run dev
```

The Vite dev server proxies any `/api/*` requests to the Express API, so the
frontend will work without additional configuration.

### Run automated tests

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd frontend
npm run test -- --run
```

### Run the API in Docker

```bash
# Build the image using the Dockerfile inside server/
docker build -t flo-api ./server

# Start the container on port 4000
docker run --rm -p 4000:4000 flo-api
```

The container only runs the Express API. The frontend remains a Vite app that you can run locally with `npm run dev` while pointing to the containerized backend.

### Run the frontend in Docker (port 8080)

```bash
# Build the static assets and image (runs from repo root)
docker build -t flo-frontend ./frontend

# Run the container on http://localhost:8080
docker run --rm -p 8080:8080 flo-frontend
```

By default the frontend assumes the API is reachable via the same origin at `/api`. When building the image you can point to a remote API by passing `--build-arg VITE_API_BASE_URL="https://your-api.example.com"`.

## Project structure

```
.
├── server/            # Express API, mock store data, Jest tests
└── frontend/          # React SPA, Vite config, Vitest + RTL tests
```

## Next steps

- Wire the order endpoint into a real fulfillment system or database
- Replace the static store catalog with a live data source
- Add authentication and order history for returning shoppers