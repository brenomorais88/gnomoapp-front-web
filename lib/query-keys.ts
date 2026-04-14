export const queryKeys = {
  health: {
    root: ["health"] as const,
    status: () => [...queryKeys.health.root, "status"] as const,
  },
  categories: {
    root: ["categories"] as const,
    list: (params?: unknown) => [...queryKeys.categories.root, "list", params ?? {}] as const,
    detail: (id: string) => [...queryKeys.categories.root, "detail", id] as const,
  },
  accounts: {
    root: ["accounts"] as const,
    list: (params?: unknown) => [...queryKeys.accounts.root, "list", params ?? {}] as const,
    detail: (id: string) => [...queryKeys.accounts.root, "detail", id] as const,
  },
  occurrences: {
    root: ["occurrences"] as const,
    list: (params?: unknown) => [...queryKeys.occurrences.root, "list", params ?? {}] as const,
    detail: (id: string) => [...queryKeys.occurrences.root, "detail", id] as const,
  },
  dashboard: {
    root: ["dashboard"] as const,
    summary: () => [...queryKeys.dashboard.root, "summary"] as const,
  },
} as const;
