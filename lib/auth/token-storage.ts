const ACCESS_TOKEN_STORAGE_KEY = "daily-web.access-token";

let memoryAccessToken: string | null = null;

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getStoredAccessToken() {
  if (memoryAccessToken) {
    return memoryAccessToken;
  }

  if (!canUseLocalStorage()) {
    return null;
  }

  const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  memoryAccessToken = token;
  return token;
}

export function setStoredAccessToken(token: string) {
  memoryAccessToken = token;

  if (canUseLocalStorage()) {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  }
}

export function clearStoredAccessToken() {
  memoryAccessToken = null;

  if (canUseLocalStorage()) {
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }
}
