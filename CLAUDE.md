# St. Elias Ministry — Community Service Events App

## Project Overview
Web app for St. Elias Orthodox Church (Austin, TX) to manage community service events.
Public visitors browse events and sign up to volunteer (no login needed).
Admins/organizers log in via email magic link to manage events, volunteers, and announcements.

## Tech Stack
- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS + @tailwindcss/forms + @tailwindcss/typography
- **Auth**: NextAuth.js v5 (email magic link, organizers only)
- **Database**: PostgreSQL + Prisma ORM
- **Icons**: Lucide React
- **Forms**: react-hook-form + zod validation
- **Deployment**: Railway (staging/main branch auto-deploy)

## Project Structure
```
src/
  app/
    (public)/     — Public pages (landing, events, ideas, impact, about, login)
    (admin)/      — Admin pages (dashboard, events, volunteers, ideas, announcements, ministries, reports)
    api/          — API route handlers
  components/
    ui/           — Reusable UI components (Button, Input, Card, Badge, etc.)
    layout/       — Layout components (PublicHeader, Footer, AdminSidebar)
    events/       — Event components (EventCard, SignUpForm)
  lib/            — Utilities (prisma, auth, validations, utils)
  types/          — TypeScript types
  middleware.ts   — Route protection for /admin/*
```

## Key Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:migrate   # Run Prisma migrations
npm run db:push      # Push schema to DB (no migration)
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio GUI
```

## Auth Model
- Public visitors: no login, sign up with name/email/phone
- Admins/Organizers: email magic link login, protected /admin/* routes
- Separate User (admins) and Volunteer (public) models

## Database
- Schema in `prisma/schema.prisma`
- Key models: User, Volunteer, Event, EventRSVP, EventRole, Ministry, Idea, Comment, Announcement
- Seed data in `prisma/seed.ts`

## Deployment
- Railway with PostgreSQL addon
- `staging` branch → staging environment
- `main` branch → production
- Dockerfile + railway.toml configured
- Env vars: DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, EMAIL_* (Resend)
