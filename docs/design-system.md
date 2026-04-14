# Design System Foundation

This document defines the visual language used by the frontend foundation.

## Brand Intent

- Feeling: clear, modern, calm, premium-simple
- Interface style: minimalist dashboard
- Priority: readability, hierarchy, and practical decision support

## Core Tokens

- Primary: `#2563EB`
- Secondary accent: `#7C3AED`
- Background: `#F8FAFC`
- Surface/Card: `#FFFFFF`
- Main text: `#0F172A`
- Secondary text: `#64748B`
- Success: `#16A34A`
- Warning: `#F59E0B`
- Danger: `#DC2626`
- Font: Inter

## Global Styling Rules

- App background uses `background` token to keep pages calm and soft.
- Cards and sections use subtle shadows and clear borders (`border-border/80`).
- Focus states use visible ring (`ring-ring/40`) with offset for accessibility.
- Spacing follows responsive shell spacing (`px-4` -> `sm:px-6` -> `lg:px-8`).

## Shared Primitives

- `AppPageContainer`: responsive max-width page wrapper
- `PageHeader`: standardized title + description + optional actions
- `SectionCard`: reusable card section with optional heading and actions
- `SummaryCard`: metric card for quick dashboard scan
- `StatusBadge`: semantic badge (`success`, `warning`, `danger`, `info`, `neutral`)
- `Toolbar`: filter/action row wrapper
- `DataTable`: responsive table container
- `EmptyState`, `LoadingState`, `ErrorState`: standard feedback components

## UX Guidelines

- Prefer whitespace and typography hierarchy over decorative elements.
- Keep color usage semantic and intentional.
- Limit shadows to subtle depth cues only.
- Design for scanability first, interaction second, decoration last.
