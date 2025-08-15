# Contributing to Dashway

Thanks for your interest in contributing! We welcome issues, bugfixes, documentation, and new features.

## How to contribute
1. Fork the repository and create a branch from `main`.
2. If you’ve added code, add tests where reasonable.
3. Ensure the app builds and basic flows work (login, set master password, CRUD items).
4. Open a Pull Request with a clear description.

## Development setup
- Node 18+
- From repo root: `npm install` (runs client/server installs) then `npm start`.
- Frontend: React 18, Vite, TS, Tailwind.
- Backend: Express, Sequelize (SQLite), JWT.

## Coding standards
- TypeScript on the client, modern JS on the server.
- Keep public APIs stable; when changing routes or types, update the OpenAPI spec and client APIs.
- Keep encryption model consistent (AES‑256‑GCM + PBKDF2). Avoid weakening crypto.

## Security
- Never log secrets or the master password.
- Review auth and crypto changes carefully.

## We’re hiring contributors
We’re especially looking for:
- Mobile app builders (React Native/Expo or Flutter)
- Browser extension developers (Chromium/Firefox)

Open an issue to coordinate work before starting a large effort.
