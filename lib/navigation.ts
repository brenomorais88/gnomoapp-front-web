import {
  CalendarRange,
  LayoutDashboard,
  ListTodo,
  Users,
  WalletCards,
} from "lucide-react";

export const financeNavigationItems = [
  {
    labelKey: "navigation.financeDashboard",
    href: "/financial-dashboard",
    icon: LayoutDashboard,
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

export const appNavigationMenuItems = [
  {
    labelKey: "navigation.dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    labelKey: "navigation.family",
    href: "/family",
    icon: Users,
  },
  {
    labelKey: "navigation.finance",
    icon: WalletCards,
    children: financeNavigationItems,
  },
] as const;

export const appNavigationItems = [
  appNavigationMenuItems[0],
  appNavigationMenuItems[1],
  ...financeNavigationItems,
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
