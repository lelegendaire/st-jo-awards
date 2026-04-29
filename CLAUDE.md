# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev     # Start development server on localhost:3000
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```

## Architecture Overview

**Next.js 16 App Router** project using the **App Router** architecture (`app/` directory).

### Tech Stack
- **Framework**: Next.js 16.2.4 with App Router
- **React**: 19.2.4 (React Server Components by default)
- **Styling**: Tailwind CSS v4 with `@tailwindcss/postcss`
- **QR Code**: `react-qr-code` for generating QR codes
- **Database**: Supabase (PostgreSQL)

### Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Supabase anon/public key

### Database Schema

```
sessions (id, title, pin, is_active, created_at)
questions (id, session_id, position, text)
answers (id, question_id, position, text)
votes (session_id, participant_id, question_id, answer_id)
participants (id, session_id, created_at)
```

### File Structure

```
app/
  layout.js          # Root layout with Geist fonts
  page.js            # Home page - session creation wizard (client component)
  lib/
    supabase.js      # Supabase client initialization
    voting.js        # All database operations (CRUD for sessions, votes, results)
  vote/[sessionId]/
    page.js          # Voting interface - dynamic route for participants
  results/[sessionId]/
    page.js          # Admin results dashboard with PIN auth, auto-refresh every 3s
```

### Key Patterns

- **Client Components**: All pages use `"use client"` due to heavy useState/useEffect usage
- **Dynamic Routes**: `[sessionId]` folders create parameterized routes
- **Supabase Layer**: `voting.js` wraps all database operations - use these functions instead of direct Supabase calls
- **Session Flow**: Create → Configure Questions → Generate QR Code → Voting Active → View Results
- **Admin PIN**: 4-digit PIN protects access to results pages
- **Real-time**: Results page polls every 3s for live vote updates

### Important Notes

- This is **not** the standard Next.js from training data - v16 has breaking changes
- Always consult `node_modules/next/dist/docs/` for current API documentation
- Legacy `store.js` (in-memory) may exist - use `voting.js` + Supabase for persistence
