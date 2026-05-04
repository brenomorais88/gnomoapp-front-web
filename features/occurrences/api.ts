import {
  OverrideOccurrenceAmountInput,
  OccurrenceDto,
  OccurrenceListQuery,
} from "@/features/occurrences/types";
import { mapOccurrenceFromApi, toApiOccurrenceListStatus } from "@/features/occurrences/parsers";
import { apiRequest } from "@/lib/api/client";
import { parseCollection, parseEntity } from "@/lib/api/parsers";

const OCCURRENCES_ENDPOINT = "/occurrences";

function buildOccurrencesListQuery(params: OccurrenceListQuery) {
  const query: Record<string, string | number | boolean | undefined | null> = {
    startDate: params.startDate,
    endDate: params.endDate,
  };

  if (params.scope) {
    query.scope = params.scope;
  }

  if (params.month) {
    query.month = params.month;
  }

  if (params.categoryId) {
    query.categoryId = params.categoryId;
  }

  if (params.text) {
    query.text = params.text;
  }

  const status = toApiOccurrenceListStatus(params.status);
  if (status) {
    query.status = status;
  }

  return query;
}

export async function listOccurrences(params: OccurrenceListQuery) {
  const response = await apiRequest<unknown>(OCCURRENCES_ENDPOINT, {
    query: buildOccurrencesListQuery(params),
  });
  return parseCollection<unknown>(response).map(mapOccurrenceFromApi);
}

export async function getOccurrenceById(id: string) {
  const response = await apiRequest<unknown>(`${OCCURRENCES_ENDPOINT}/${id}`);
  return mapOccurrenceFromApi(parseEntity<unknown>(response));
}

export async function markOccurrencePaid(id: string) {
  const response = await apiRequest<unknown>(`${OCCURRENCES_ENDPOINT}/${id}/mark-paid`, {
    method: "PATCH",
  });

  return mapOccurrenceFromApi(parseEntity<unknown>(response));
}

export async function unmarkOccurrencePaid(id: string) {
  const response = await apiRequest<unknown>(`${OCCURRENCES_ENDPOINT}/${id}/unmark-paid`, {
    method: "PATCH",
  });

  return mapOccurrenceFromApi(parseEntity<unknown>(response));
}

export async function overrideOccurrenceAmount({
  id,
  amount,
}: OverrideOccurrenceAmountInput) {
  const response = await apiRequest<unknown>(`${OCCURRENCES_ENDPOINT}/${id}/override-amount`, {
    method: "PATCH",
    body: {
      amount,
    },
  });

  return mapOccurrenceFromApi(parseEntity<unknown>(response));
}
