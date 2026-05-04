import { describe, expect, it, vi } from "vitest";
import {
  useMarkOccurrencePaidMutation,
  useOverrideOccurrenceAmountMutation,
  useUnmarkOccurrencePaidMutation,
} from "./hooks";
import { queryKeys } from "@/lib/query-keys";

const useApiMutationMock = vi.fn((options) => options);

vi.mock("@/hooks/api/use-api-mutation", () => ({
  useApiMutation: (options: unknown) => useApiMutationMock(options),
}));

describe("occurrence mutations hooks", () => {
  it("configures mark paid with dashboard revalidation", () => {
    const config = useMarkOccurrencePaidMutation();
    expect(config.invalidateQueryKeys).toEqual([
      queryKeys.occurrences.root,
      queryKeys.dashboard.root,
    ]);
  });

  it("configures unmark paid with dashboard revalidation", () => {
    const config = useUnmarkOccurrencePaidMutation();
    expect(config.invalidateQueryKeys).toEqual([
      queryKeys.occurrences.root,
      queryKeys.dashboard.root,
    ]);
  });

  it("keeps override mutation revalidation consistent", () => {
    const config = useOverrideOccurrenceAmountMutation();
    expect(config.invalidateQueryKeys).toEqual([
      queryKeys.occurrences.root,
      queryKeys.dashboard.root,
    ]);
  });
});
