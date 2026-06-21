# CampusBytes

Our hostel used paper logs for mess check-ins. This replaces that.

Students show up, scan a QR code, the warden verifies & we are done.

## What it does

- Students sign in with a password or a passkey (Face ID / fingerprint, whatever their phone supports)
- Every day, each student gets a fresh QR pass for each meal slot.
- The warden scans it or looks up a student manually to check them in
- There's a live dashboard that tracks how many meals have been served and logs every check-in

## Security stuff

- QR passes are cryptographically signed (HMAC-SHA256) and expire daily, so you can't screenshot someone else's pass or reuse an old one
- Passwords are bcrypt-hashed
- Sessions are JWTs in http-only cookies — JavaScript can't touch them
- Every API endpoint is rate-limited via Upstash Redis, blocked at the edge before requests even reach the server
- Scanning the same pass twice physically cannot create a duplicate entry — the database rejects it at the constraint level

## Stack

- Next.js 16 (App Router)
- PostgreSQL on Supabase with Prisma
- SimpleWebAuthn for passkeys
- Upstash Redis for rate limiting
- Tailwind CSS v4

## Running locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with:
   ```
   DATABASE_URL=
   JWT_SECRET=
   QR_SECRET=
   UPSTASH_REDIS_REST_URL=
   UPSTASH_REDIS_REST_TOKEN=
   ```

3. Push the schema and start the dev server:
   ```bash
   npx prisma db push
   npm run dev
   ```
