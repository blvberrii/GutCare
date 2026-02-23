# GutCare - Gut Health Product Scanner

## Overview

GutCare is a mobile-first web application that helps users with gut health conditions (IBS, SIBO, Crohn's, Celiac, etc.) evaluate wellness and grocery products. Users can scan product barcodes or images to receive personalized gut health grades (A-F scale with 0-100 scores) based on their specific conditions, symptoms, and allergies. The app features an AI assistant mascot named "Toto" (a friendly whale) for guidance and recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state and caching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **Design System**: Wellness-focused palette with soft cream backgrounds, teal primary, and coral accent colors

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript throughout (shared types between client/server)
- **API Structure**: RESTful endpoints under `/api/*` with typed contracts in `shared/routes.ts`
- **Build System**: esbuild for server bundling, Vite for client bundling

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Drizzle Kit for schema management (`npm run db:push`)
- **Session Storage**: PostgreSQL-backed sessions via `connect-pg-simple`

### Authentication
- **Provider**: Replit Auth (OpenID Connect)
- **Session**: Express-session with PostgreSQL store
- **Flow**: OAuth2 with automatic user upsert on login
- **Protected Routes**: `isAuthenticated` middleware checks session validity

### Key Data Models
- **Users**: Core authentication data (id, email, name, profile image)
- **UserProfiles**: Extended health data (conditions, symptoms, allergies, DOB, gender)
- **Scans**: Product analysis results (barcode, grade, score, positives/negatives, alternatives)
- **Conversations/Messages**: Chat history with AI assistant

### AI Integration
- **Provider**: Google Gemini via Replit AI Integrations
- **Models Used**: 
  - `gemini-2.5-flash` for chat and text analysis
  - `gemini-2.5-flash-image` for image generation
- **Features**: Product ingredient analysis, personalized gut health grading, conversational AI assistant

## External Dependencies

### Third-Party Services
- **Replit AI Integrations**: Provides Gemini API access without requiring a separate API key (uses `AI_INTEGRATIONS_GEMINI_API_KEY` and `AI_INTEGRATIONS_GEMINI_BASE_URL` environment variables)
- **Replit Auth**: OpenID Connect authentication via `ISSUER_URL`

### Database
- **PostgreSQL**: Required database, connection via `DATABASE_URL` environment variable

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `AI_INTEGRATIONS_GEMINI_API_KEY`: Gemini API key from Replit integrations
- `AI_INTEGRATIONS_GEMINI_BASE_URL`: Gemini API base URL from Replit integrations
- `ISSUER_URL`: Replit OIDC issuer (defaults to `https://replit.com/oidc`)
- `REPL_ID`: Automatically set by Replit environment

### Key NPM Packages
- Frontend: React, Wouter, TanStack Query, Framer Motion, shadcn/ui components, Lucide icons
- Backend: Express, Drizzle ORM, Passport, connect-pg-simple
- Shared: Zod for validation, drizzle-zod for schema integration