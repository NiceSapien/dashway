# Dashway – Open-source Password Manager

Dashway is a modern, full‑stack password manager inspired by Dashlane and Bitwarden. It supports secure storage for passwords, notes, payment methods, and personal information using AES‑256‑GCM encryption with a master password.

- Frontend: React 18 (Vite, TypeScript, Tailwind, Radix UI)
- Backend: Node.js/Express, Sequelize + SQLite by default
- Crypto: AES‑256‑GCM with PBKDF2 key derivation (100k iterations) and per‑record salt

We’re actively looking for contributors to help build a native mobile app and a browser extension. If that’s you, see Contributing below and open an issue!

## Features
- Secure vault for passwords, secure notes, payment methods, and personal info
- Per‑entry AES‑256‑GCM with PBKDF2(masterPassword, salt)
- Master password never leaves the client; sent only as header to decrypt/encrypt on the server per request
- JWT authentication with access/refresh tokens
- Responsive UI with grid/list views

## Screenshots
- Dashboard
- Passwords
- Secure Notes

## Quick start (development)
- Requirements: Node 18+, pnpm or npm

1) Install
- From the repo root, the root postinstall installs client and server packages.

2) Run
- From repo root, run the top-level script to start both client and server.

3) Visit
- Frontend: http://localhost:5173
- API: http://localhost:3000

## Configuration
- Client uses `VITE_API_BASE_URL` at build time for production. In development, Vite proxy forwards `/api` to `localhost:3000`.
- Server uses JWT secrets and listens on `PORT` (default 3000) and `HOST` (default 0.0.0.0).

Environment variables (server):
- JWT_SECRET
- REFRESH_TOKEN_SECRET
- HOST (optional, default 0.0.0.0)
- PORT (optional, default 3000)

Environment variables (client build):
- VITE_API_BASE_URL (e.g., https://your-api.example.com)

## Production deployment
- Frontend (Vercel): set project root to `client`, build with `npm run build`, output `dist`. Add `VITE_API_BASE_URL` to point to your backend URL.
- Backend: deploy the `server` folder to a host that supports persistent storage (Render, Railway, Fly.io). SQLite is the default. For production durability, consider migrating to Postgres.

CORS: The server currently allows all origins via `cors()`. Lock this down for production.

## Optional S3 backups (external storage)
By default, the server stores data in SQLite. You can also enable optional S3 backups of the SQLite file or JSON exports.

- Set the following env vars (server):
  - S3_ENABLED=true
  - S3_BUCKET=your-bucket
  - S3_REGION=us-east-1
  - S3_ACCESS_KEY_ID=...
  - S3_SECRET_ACCESS_KEY=...
  - S3_PREFIX=dashway/ (optional)

When enabled, the server will expose endpoints to export/import encrypted data to S3 and perform periodic backups (see Self-hosting guide).

## API docs
An OpenAPI 3.1 spec is provided in `server/openapi.yaml` with detailed endpoints and examples.

## Contributing
We welcome contributions! See `CONTRIBUTING.md` for guidelines. We’re especially seeking:
- A mobile app (iOS/Android) using a common codebase (React Native/Expo or Flutter)
- A browser extension (Chromium/Firefox) for autofill and quick add

If you’re interested, open an issue and introduce yourself.

## License
MIT
