# Frontend API Integration Foundation

This project uses `NEXT_PUBLIC_API_BASE_URL` as the single backend source of truth.

## Core Principles

- All requests go through a shared fetch wrapper.
- API errors are normalized as `ApiError`.
- Feature modules isolate request logic by domain.
- TanStack Query keys are centralized for predictable cache behavior.

## Structure

- `lib/config/env.ts` - safe env parsing and validation
- `lib/api/client.ts` - request wrapper and JSON/error handling
- `lib/api/error.ts` - standard API error type and helpers
- `lib/api/parsers.ts` - resilient response parsers for list/paginated patterns
- `lib/query-keys.ts` - shared query key organization
- `hooks/api/` - base query/mutation hook patterns
- `features/*/{types,api,hooks}.ts` - feature-specific contracts and operations

## Implemented API Feature Modules

- `health` -> `/health`
- `categories` -> `/categories`
- `accounts` -> `/accounts`
- `occurrences` -> `/occurrences`
- `dashboard` -> `/dashboard`

## Request Pattern

1. UI calls a feature hook (`features/<module>/hooks.ts`).
2. Hook uses TanStack Query (`useApiQuery` / `useApiMutation`).
3. Hook calls feature API function (`features/<module>/api.ts`).
4. API function calls `apiRequest()` from `lib/api/client.ts`.
5. Errors are converted to `ApiError` and exposed in React Query states.

## DTO Typing Strategy

DTO interfaces are defined per feature under `features/*/types.ts`.
The shapes are intentionally strict enough for development and flexible enough to adapt to backend evolution.

## Mutation Cache Strategy

Mutations accept `invalidateQueryKeys` to invalidate only relevant cache groups.
This avoids global cache invalidation and keeps updates predictable.

## Example: Health Check

Dashboard placeholder consumes `useHealthStatusQuery()` to validate integration flow and render loading/success/error states.
