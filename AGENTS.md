# AGENTS.md

## Project location

All code lives in `qrcode/`. The repo root is empty except for this file. Always run commands from `qrcode/`.

## Next.js 16 (not your training data)

- Version: **16.2.4**. APIs, conventions, and file structure differ from Next.js 14/15.
- Always consult `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.

## Tailwind CSS v4

- Uses `@tailwindcss/postcss` (not `tailwindcss` v3). Syntax differs:
  - Gradients: `bg-linear-to-br` not `bg-gradient-to-br`
  - No `tailwind.config.js` — config is done via CSS `@theme` blocks or defaults
- Do not create a `tailwind.config.js` unless explicitly needed.

## React Compiler

- Enabled in `next.config.mjs` (`reactCompiler: true`).
- Avoid manual `useMemo`/`useCallback` unless the compiler cannot handle the case.

## Architecture

- All pages are `"use client"` — no React Server Components in use.
- **`app/lib/voting.js`** is the single database layer. Always use its exported functions; never call Supabase directly from components.
- Session IDs are random strings (`Math.random().toString(36)`), not UUIDs.

## Commands

```bash
cd qrcode
npm run dev      # dev server on :3000
npm run build    # production build
npm run start    # prod server
npm run lint     # ESLint
```

No test framework is configured.

## Environment

- `.env.local` required with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `.env*` is gitignored. Do not commit secrets.

## Database setup

- Migrations: `supabase_migration.sql` and `supabase-rls-setup.sql` in the project root.
- RLS policies must be applied for Supabase security.

## Imports

- `@/*` alias maps to project root (`jsconfig.json`). Use `@/app/lib/voting` style imports.

## See also

- `CLAUDE.md` — detailed architecture, schema, and file structure.
