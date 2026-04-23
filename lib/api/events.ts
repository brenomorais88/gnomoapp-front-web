import { ApiError } from "@/lib/api/error";

export type ApiClientEvent =
  | {
      type: "unauthorized";
      error: ApiError;
    }
  | {
      type: "request-error";
      error: ApiError;
    };

type ApiClientEventListener = (event: ApiClientEvent) => void;

const listeners = new Set<ApiClientEventListener>();

export function emitApiClientEvent(event: ApiClientEvent) {
  for (const listener of listeners) {
    listener(event);
  }
}

export function subscribeToApiClientEvents(listener: ApiClientEventListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
