import { getApiBaseUrl } from "@/lib/config/env";
import { ApiError } from "@/lib/api/error";

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiRequestOptions = {
  method?: ApiMethod;
  body?: unknown;
  headers?: HeadersInit;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
};

function buildUrl(path: string, query?: ApiRequestOptions["query"]) {
  const sanitizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${getApiBaseUrl()}${sanitizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") {
        continue;
      }

      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const text = await response.text();
    return text ? { message: text } : null;
  }

  return response.json();
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const { method = "GET", body, query, headers, signal } = options;

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    const errorPayload =
      typeof responseBody === "object" && responseBody !== null
        ? (responseBody as Record<string, unknown>)
        : null;

    throw new ApiError(
      String(errorPayload?.message ?? `Request failed with status ${response.status}`),
      {
        status: response.status,
        code: String(errorPayload?.code ?? "API_REQUEST_FAILED"),
        details: responseBody,
      },
    );
  }

  return responseBody as T;
}
