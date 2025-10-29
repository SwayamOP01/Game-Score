# Troubleshooting Guide

This guide helps diagnose issues with the Upload → Analyze flow.

## Analyze Button Not Working
- Ensure you are signed in: the button requires `session.user.email`.
- Select a `Game` and `Region`: both are mandatory.
- Upload a valid clip: `mp4` or `mov`, 1–5 minutes.
- Watch for inline errors under the file input and above the button.

## Common API Errors
- `/api/user/by-email` returns 404
  - Sign up first via `/auth` or check that you are signed in.
  - The upload page will show: “Account not found. Please sign up…”.
- `/api/upload` returns 400
  - Missing `file`, `game`, `region`, or `userId`.
  - The upload page will show: “Upload failed. Check your clip and try again.”

## Analysis Page Errors
- Visiting `/analysis/undefined` or with an invalid ID
  - The page now guards against bad IDs and shows Not Found.
  - Avoid manual navigation with missing IDs; use the redirect from upload.

## Debug Logs
- Prisma and route handlers log timings and errors to the server console:
  - Upload handler: `upload_handler` timing, missing fields, created analysis ID.
  - Signup handler: `signup_handler` timing, invalid payload/password issues.
  - User lookup: `user_by_email_handler` timing, missing email/not found.

## Local Checklist
- Run dev server: `npm run dev`.
- Run lint: `npm run lint` (fixes reported issues).
- Run tests: `npm test` (prints coverage and route diagnostics).

## If Problems Persist
- Share the exact steps and any console/server logs.
- Include clip details (type/size/duration) and selected game/region.