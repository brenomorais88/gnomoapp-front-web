import {
  CreateOccurrenceInput,
  OccurrenceDto,
  OccurrenceListQuery,
  UpdateOccurrenceInput,
} from "@/features/occurrences/types";
import { apiRequest } from "@/lib/api/client";
import { parseCollection, parseEntity } from "@/lib/api/parsers";

const OCCURRENCES_ENDPOINT = "/occurrences";

export async function listOccurrences(params?: OccurrenceListQuery) {
  const response = await apiRequest<unknown>(OCCURRENCES_ENDPOINT, { query: params });
  return parseCollection<OccurrenceDto>(response);
}

export async function getOccurrenceById(id: string) {
  const response = await apiRequest<unknown>(`${OCCURRENCES_ENDPOINT}/${id}`);
  return parseEntity<OccurrenceDto>(response);
}

export async function createOccurrence(payload: CreateOccurrenceInput) {
  const response = await apiRequest<unknown>(OCCURRENCES_ENDPOINT, {
    method: "POST",
    body: payload,
  });
  return parseEntity<OccurrenceDto>(response);
}

export async function updateOccurrence({
  id,
  payload,
}: {
  id: string;
  payload: UpdateOccurrenceInput;
}) {
  const response = await apiRequest<unknown>(`${OCCURRENCES_ENDPOINT}/${id}`, {
    method: "PUT",
    body: payload,
  });
  return parseEntity<OccurrenceDto>(response);
}

export async function deleteOccurrence(id: string) {
  return apiRequest<void>(`${OCCURRENCES_ENDPOINT}/${id}`, {
    method: "DELETE",
  });
}
