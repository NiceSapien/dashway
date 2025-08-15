# Self-hosting Dashway

This guide helps you run Dashway yourself.

## Architecture
- Client (Vite/React) served by Vercel or any static host.
- Server (Express) runs on a host with persistent storage:
  - Default DB: SQLite (`./server/config/config.json` → `production.storage = ./prod.sqlite3`).
  - Consider Postgres for multi-user, backups, and durability.

## Prerequisites
- Node 18+
- A server host (Render, Railway, Fly.io, or your own VM)

## Server setup
1. Set environment variables:
   - JWT_SECRET, REFRESH_TOKEN_SECRET
   - HOST (default 0.0.0.0), PORT (default 3000)
2. Persistent storage:
   - Ensure `server/prod.sqlite3` is on a mounted/persistent volume.
3. Run: `node server.js` within the `server` directory.

## Optional: S3 backups and import/export
You can enable optional S3 export/import of encrypted records or SQLite backups.

Environment variables:
- S3_ENABLED=true
- S3_BUCKET=your-bucket
- S3_REGION=us-east-1
- S3_ACCESS_KEY_ID=...
- S3_SECRET_ACCESS_KEY=...
- S3_PREFIX=dashway/ (optional)

With these set, the server exposes:
- POST `/api/backup/export` → exports an encrypted JSON snapshot to S3.
- POST `/api/backup/import` → imports a snapshot from S3 (admin only).
- POST `/api/backup/sqlite/upload` → uploads the SQLite file to S3.
- GET  `/api/backup/sqlite/download` → streams the SQLite file from S3.

Notes:
- Snapshots contain encrypted payloads; secrets remain encrypted.
- You are responsible for S3 bucket policies and encryption at rest (SSE).

## Client setup
- Build with `VITE_API_BASE_URL` set to your server URL.
- Deploy the `client/dist` to any static host (Vercel, Netlify, S3+CloudFront, Nginx).

## Hardening tips
- Restrict CORS to your known frontend domain.
- Rotate JWT secrets regularly.
- Enable HTTPS everywhere; set `trust proxy` only when behind a trusted proxy.
- Back up regularly (automate S3 exports).
