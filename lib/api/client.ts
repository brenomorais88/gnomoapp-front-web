import { getApiBaseUrl } from "@/lib/config/env";
import { ApiError } from "@/lib/api/error";
import { emitApiClientEvent } from "@/lib/api/events";

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiRequestOptions = {
  method?: ApiMethod;
  body?: unknown;
  headers?: HeadersInit;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
};

type AccessTokenResolver = () => string | null | undefined;

let accessTokenResolver: AccessTokenResolver | null = null;

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

export function setApiAccessTokenResolver(resolver: AccessTokenResolver | null) {
  accessTokenResolver = resolver;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const { method = "GET", body, query, headers, signal } = options;
  const accessToken = accessTokenResolver?.();
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");

  if (body) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  if (process.env.NODE_ENV !== "production" && path.startsWith("/families/me")) {
    console.info("[api] request debug", {
      path,
      method,
      hasAccessToken: Boolean(accessToken),
      hasAuthorizationHeader: requestHeaders.has("Authorization"),
    });
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    const apiError = new ApiError("Unable to connect to the server", {
      status: 0,
      code: "NETWORK_ERROR",
      details: error,
    });

    emitApiClientEvent({ type: "request-error", error: apiError });
    throw apiError;
  }

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    const errorPayload =
      typeof responseBody === "object" && responseBody !== null
        ? (responseBody as Record<string, unknown>)
        : null;

    const apiError = new ApiError(
      String(errorPayload?.message ?? `Request failed with status ${response.status}`),
      {
        status: response.status,
        code: String(errorPayload?.code ?? "API_REQUEST_FAILED"),
        details: responseBody,
      },
    );

    emitApiClientEvent({
      type: response.status === 401 ? "unauthorized" : "request-error",
      error: apiError,
    });

    throw apiError;
  }

  return responseBody as T;
}
