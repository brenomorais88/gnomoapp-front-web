export const queryKeys = {
  auth: {
    root: ["auth"] as const,
    session: () => [...queryKeys.auth.root, "session"] as const,
  },
  users: {
    root: ["users"] as const,
    current: () => [...queryKeys.users.root, "current"] as const,
  },
  families: {
    root: ["families"] as const,
    me: () => [...queryKeys.families.root, "me"] as const,
    list: () => [...queryKeys.families.root, "list"] as const,
    members: (familyId: string) =>
      [...queryKeys.families.root, "members", familyId] as const,
    memberPermissions: (memberId: string) =>
      [...queryKeys.families.root, "member-permissions", memberId] as const,
  },
  permissions: {
    root: ["permissions"] as const,
    list: () => [...queryKeys.permissions.root, "list"] as const,
  },
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
    financialData: (params: unknown) =>
      [...queryKeys.dashboard.root, "financial-data", params] as const,
    home: (month: string) => [...queryKeys.dashboard.root, "home", month] as const,
    day: (date: string) => [...queryKeys.dashboard.root, "day", date] as const,
    categorySummary: (month: string) =>
      [...queryKeys.dashboard.root, "category-summary", month] as const,
    next12Months: (includeDetails: boolean) =>
      [...queryKeys.dashboard.root, "next-12-months", includeDetails] as const,
  },
} as const;
