# Daily Web Frontend

Daily Web is a frontend for bill and occurrence management built with a clean, responsive, dashboard-first UX.

## Main technologies

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query for server-state management
- React Hook Form + Zod for form handling and validation
- Recharts for dashboard/projection visualizations

## Local run

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required variable:

- `NEXT_PUBLIC_API_BASE_URL` (example: `http://localhost:8081/`)

### 3) Start development server

```bash
npm run dev
```

### 4) Validation commands

```bash
npm run lint
npm run build
```

## Available pages

- `/` - Dashboard (summary, calendar/list toggle, category chart)
- `/categories` - Categories CRUD
- `/accounts` - Accounts list + actions
- `/accounts/new` - Create account
- `/accounts/[id]` - Account details
- `/accounts/[id]/edit` - Edit account
- `/occurrences` - Occurrences CRUD
- `/next-12-months` - 12-month grouped projection and chart

## Project organization

- `app/` - Route definitions and top-level layouts
- `features/` - Feature-driven API/contracts/hooks/components
  - `features/dashboard` - Dashboard data hooks and types
  - `features/categories` - Categories DTOs/API/hooks/forms
  - `features/accounts` - Accounts DTOs/API/hooks/forms
  - `features/occurrences` - Occurrences DTOs/API/hooks/forms
- `components/shared/` - Reusable layout and UI building blocks
- `components/ui/` - shadcn/ui primitives
- `lib/api/` - Shared request client, parser, and error handling
- `lib/config/` - Safe environment config
- `hooks/api/` - Base React Query patterns
- `docs/` - Design system and API integration docs

## Backend integration expectations

- Backend is the single source of truth.
- Frontend only calls real backend module endpoints:
  - `/health`
  - `/categories`
  - `/accounts`
  - `/occurrences`
  - `/dashboard`
- Request/response handling is centralized in `lib/api/client.ts`.
- API errors are normalized as `ApiError` for consistent UX feedback.
- Query keys are centralized in `lib/query-keys.ts`.

## Validation scope

Current UI is prepared for manual end-to-end validation with backend data, including:

- loading/empty/error handling
- mutation feedback (create/update/delete/activate/deactivate)
- responsive navigation and page layouts
- dashboard insights + 12-month projection
