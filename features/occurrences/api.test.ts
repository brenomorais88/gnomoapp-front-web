import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getOccurrenceById,
  listOccurrences,
  markOccurrencePaid,
  overrideOccurrenceAmount,
  unmarkOccurrencePaid,
} from "./api";

describe("occurrences api", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8081";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lists occurrences using only documented query params", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              id: "o1",
              description: "Conta Luz",
              amount: "100.50",
              dueDate: "2026-04-22",
              status: "PENDING",
              scope: "FAMILY",
            },
          ],
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await listOccurrences({
      startDate: "2026-04-01",
      endDate: "2026-04-30",
      month: "2026-04",
      text: "Luz",
      status: "pending",
      scope: "VISIBLE_TO_ME",
    });
    expect(result[0]).toMatchObject({
      id: "o1",
      status: "pending",
      scope: "FAMILY",
    });

    const requestUrl = String(fetchMock.mock.calls[0]?.[0] ?? "");
    expect(requestUrl).toContain("startDate=2026-04-01");
    expect(requestUrl).toContain("endDate=2026-04-30");
    expect(requestUrl).toContain("month=2026-04");
    expect(requestUrl).toContain("text=Luz");
    expect(requestUrl).toContain("status=PENDING");
    expect(requestUrl).toContain("scope=VISIBLE_TO_ME");
    expect(requestUrl).not.toContain("accountId=");
    expect(requestUrl).not.toContain("size=");
  });

  it("loads occurrence detail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            id: "o2",
            description: "Conta Internet",
            amount: "89.90",
            dueDate: "2026-04-10",
            status: "PAID",
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      ),
    );

    const result = await getOccurrenceById("o2");
    expect(result.status).toBe("paid");
  });

  it("marks/unmarks paid and overrides amount", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "o3",
            description: "Conta água",
            amount: "75.00",
            dueDate: "2026-04-03",
            status: "PAID",
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "o3",
            description: "Conta água",
            amount: "75.00",
            dueDate: "2026-04-03",
            status: "PENDING",
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "o3",
            description: "Conta água",
            amount: "80.00",
            dueDate: "2026-04-03",
            status: "PENDING",
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    await markOccurrencePaid("o3");
    await unmarkOccurrencePaid("o3");
    const result = await overrideOccurrenceAmount({ id: "o3", amount: "80.00" });

    expect(result.amount).toBe(80);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
