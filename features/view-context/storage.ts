import { ViewScope } from "@/features/view-context/types";

export const VIEW_SCOPE_STORAGE_KEY = "daily-web:view-scope";
export const DEFAULT_VIEW_SCOPE: ViewScope = "VISIBLE_TO_ME";

export function isValidViewScope(value: unknown): value is ViewScope {
  return value === "VISIBLE_TO_ME" || value === "PERSONAL" || value === "FAMILY";
}

export function parseStoredViewScope(value: unknown): ViewScope {
  if (isValidViewScope(value)) {
    return value;
  }

  return DEFAULT_VIEW_SCOPE;
}

export function loadStoredViewScope(storage: Storage): ViewScope {
  return parseStoredViewScope(storage.getItem(VIEW_SCOPE_STORAGE_KEY));
}

export function saveStoredViewScope(storage: Storage, scope: ViewScope) {
  storage.setItem(VIEW_SCOPE_STORAGE_KEY, scope);
}
