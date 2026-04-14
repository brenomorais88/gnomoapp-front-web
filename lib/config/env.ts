const API_BASE_ENV_KEY = "NEXT_PUBLIC_API_BASE_URL";

let cachedApiBaseUrl: string | null = null;

export function getApiBaseUrl() {
  if (cachedApiBaseUrl) {
    return cachedApiBaseUrl;
  }

  const baseUrl = process.env[API_BASE_ENV_KEY];

  if (!baseUrl) {
    throw new Error(`${API_BASE_ENV_KEY} is required`);
  }

  try {
    const parsedUrl = new URL(baseUrl);
    cachedApiBaseUrl = parsedUrl.toString().replace(/\/$/, "");
    return cachedApiBaseUrl;
  } catch {
    throw new Error(`${API_BASE_ENV_KEY} must be a valid URL`);
  }
}
