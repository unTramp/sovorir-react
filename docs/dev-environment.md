# Dev Environment

## Current state

The frontend can now run in two modes:

- `mock API` for local development without a backend
- `real API` for integration with a live backend

Important:

- do not use an installed PWA from the home screen in local dev
- for mobile testing in dev, open the app in the browser by local network URL
- the app now clears old service workers and caches automatically in dev, but an already installed dev PWA can still behave inconsistently

## Default local behavior

The app uses the mock API by default when the configured API URL points to `localhost` or `127.0.0.1`, unless `VITE_USE_MOCK_API=false` is explicitly set.

This allows:

- login without a backend
- session restore
- token refresh flow
- authenticated app bootstrapping

## Mock credentials

Student:

- email: `student@sovorir.dev`
- password: `demo12345`

Teacher:

- email: `teacher@sovorir.dev`
- password: `teacher123`

Admin:

- email: `admin@sovorir.dev`
- password: `admin123`

## Environment variables

Example `.env.local` for mock mode:

```env
VITE_USE_MOCK_API=true
VITE_API_URL=http://localhost:3000
```

Example `.env.local` for real backend:

```env
VITE_USE_MOCK_API=false
VITE_API_URL=http://localhost:3000
```

Example `.env.local` for the deployed backend:

```env
VITE_USE_MOCK_API=false
VITE_API_URL=https://api.65-109-135-215.sslip.io
```

## Live scripts

For quick integration checks against the deployed backend, you can use dedicated scripts without editing `.env.local`:

```bash
npm run dev:live
npm run build:live
npm run preview:live
```

These scripts force:

- `VITE_USE_MOCK_API=false`
- `VITE_API_URL=https://api.65-109-135-215.sslip.io`

## What is mocked right now

Implemented mock endpoints:

- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/me`

Any other API endpoints currently return `501 Mock endpoint is not implemented`.

## Notes for backend integration

The frontend auth flow is now wired through the shared API client transport layer, so replacing the mock with a real backend does not require changing UI components.

Recommended next backend endpoints after auth:

- lesson progress sync
- flashcard progress sync
- recordings upload and retrieval
- quiz results sync
- live lesson booking

## Current live backend

The backend is currently available at:

- `https://api.65-109-135-215.sslip.io`

Seeded backend credentials:

Admin:

- email: `admin@sovorir.com`
- password: `admin1234`

Teacher:

- email: `lusine@sovorir.com`
- password: `test1234`

Student:

- email: `student@sovorir.com`
- password: `test1234`

Notes:

- the live backend is running with working auth and seeded course data
- `admin/ai/*` endpoints exist, but server-side OpenAI/Anthropic keys are still empty, so AI generation currently falls back to deterministic mock responses
