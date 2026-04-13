# Vercel Deployment Guide — AI Healthcare Chatbot

## What was changed for Vercel

1. **`vercel.json`** — updated build/output settings for monorepo (frontend subdir)
2. **`frontend/next.config.js`** — rewrites only proxy to external backend when `BACKEND_URL` is set; otherwise Next.js API routes handle requests natively
3. **`frontend/src/app/api/v1/chat/route.ts`** — NEW: Next.js serverless API route that calls OpenAI directly, so the app works on Vercel without a separate Python backend

## Architecture on Vercel

```
Browser → Vercel (Next.js frontend + /api/v1/chat serverless route) → OpenAI API
```

No Python backend is needed for basic chat functionality on Vercel.

## Required Environment Variable

| Variable | Value | Where to get it |
|---|---|---|
| `OPENAI_API_KEY` | `sk-...` | https://platform.openai.com/api-keys |

## Optional Environment Variable

| Variable | Value | Notes |
|---|---|---|
| `OPENAI_MODEL` | `gpt-3.5-turbo` | Free-tier friendly model |
| `BACKEND_URL` | `https://your-backend.onrender.com` | Only if using separate Python backend |

