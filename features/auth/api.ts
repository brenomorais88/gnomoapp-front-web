import {
  AuthCredentialsInput,
  AuthSuccessResponse,
  RegisterInput,
} from "@/features/auth/types";
import { apiRequest } from "@/lib/api/client";
import { isRecord, parseEntity } from "@/lib/api/parsers";
import { UserSummaryDto } from "@/types/domain/users";

const AUTH_ENDPOINT = "/auth";

function debugAuthPayload(
  operation: "login" | "register",
  payload: AuthCredentialsInput | RegisterInput,
) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const password = payload.password;
  const safePayload = {
    ...payload,
    password: password ? `*** (length: ${String(password).length})` : undefined,
  };

  console.info(`[auth:${operation}] sending payload`, safePayload);
}

function mapUser(payload: unknown): UserSummaryDto {
  if (!isRecord(payload)) {
    return {
      id: "",
      email: "",
      name: "",
      permissions: [],
    };
  }

  const rawPermissions = payload.permissions;
  const permissions = Array.isArray(rawPermissions)
    ? rawPermissions.map((item) => String(item))
    : [];

  return {
    id: String(payload.id ?? ""),
    email: String(payload.email ?? ""),
    name: String(
      payload.name ??
        payload.fullName ??
        [payload.firstName, payload.lastName].filter(Boolean).join(" "),
    ),
    permissions,
  };
}

function mapAuthSuccess(payload: unknown): AuthSuccessResponse {
  const entity = parseEntity<unknown>(payload);

  if (!isRecord(entity)) {
    return {
      accessToken: "",
      user: mapUser(null),
    };
  }

  return {
    accessToken: String(entity.accessToken ?? ""),
    user: mapUser(entity.user),
  };
}

export async function register(payload: RegisterInput) {
  debugAuthPayload("register", payload);

  const response = await apiRequest<unknown>(`${AUTH_ENDPOINT}/register`, {
    method: "POST",
    body: payload,
  });

  return mapAuthSuccess(response);
}

export async function login(payload: AuthCredentialsInput) {
  debugAuthPayload("login", payload);

  const response = await apiRequest<unknown>(`${AUTH_ENDPOINT}/login`, {
    method: "POST",
    body: payload,
  });

  return mapAuthSuccess(response);
}

export async function getMe() {
  const response = await apiRequest<unknown>(`${AUTH_ENDPOINT}/me`);
  const entity = parseEntity<unknown>(response);
  return mapUser(entity);
}
