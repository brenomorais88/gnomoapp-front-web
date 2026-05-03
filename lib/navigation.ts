import {
  CalendarRange,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Users,
  WalletCards,
} from "lucide-react";

export const appNavigationItems = [
  {
    labelKey: "navigation.dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    labelKey: "navigation.categories",
    href: "/categories",
    icon: FolderKanban,
  },
  {
    labelKey: "navigation.family",
    href: "/family",
    icon: Users,
  },
  {
    labelKey: "navigation.accounts",
    href: "/accounts",
    icon: WalletCards,
  },
  {
    labelKey: "navigation.occurrences",
    href: "/occurrences",
    icon: ListTodo,
  },
  {
    labelKey: "navigation.next12Months",
    href: "/next-12-months",
    icon: CalendarRange,
  },
] as const;

export function getRouteLabelKey(pathname: string) {
  if (pathname === "/profile" || pathname.startsWith("/profile/")) {
    return "navigation.profile";
  }

  const item = appNavigationItems.find((navItem) =>
    navItem.href === "/"
      ? pathname === "/"
      : pathname === navItem.href || pathname.startsWith(`${navItem.href}/`),
  );
  return item?.labelKey ?? "common.appName";
}
