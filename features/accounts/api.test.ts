import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  activateAccount,
  createAccount,
  deactivateAccount,
  deleteAccount,
  getAccountById,
  listAccounts,
  updateAccount,
} from "./api";

describe("accounts api", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8081";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lists accounts with scope and decimal amount", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: [
              {
                id: "a1",
                title: "Conta casa",
                baseAmount: "120.50",
                scope: "FAMILY",
                ownershipType: "FAMILY",
                categoryId: "c1",
                recurrenceType: "MONTHLY",
                startDate: "2026-01-10",
                responsibleMemberId: "m1",
              },
            ],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      ),
    );

    const result = await listAccounts({ scope: "FAMILY" });
    expect(result[0]).toMatchObject({
      id: "a1",
      baseAmount: "120.50",
      ownershipType: "FAMILY",
      responsibleMemberId: "m1",
    });
  });

  it("runs account CRUD endpoints", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "a2",
            title: "Personal",
            baseAmount: "90.00",
            ownershipType: "PERSONAL",
            categoryId: "c2",
            recurrenceType: "MONTHLY",
            startDate: "2026-01-01",
          }),
          {
            status: 201,
            headers: { "content-type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "a2",
            title: "Personal edit",
            baseAmount: "90.00",
            ownershipType: "PERSONAL",
            categoryId: "c2",
            recurrenceType: "MONTHLY",
            startDate: "2026-01-01",
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "a2",
            title: "Personal edit",
            baseAmount: "90.00",
            ownershipType: "PERSONAL",
            categoryId: "c2",
            recurrenceType: "MONTHLY",
            startDate: "2026-01-01",
            active: true,
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "a2",
            title: "Personal edit",
            baseAmount: "90.00",
            ownershipType: "PERSONAL",
            categoryId: "c2",
            recurrenceType: "MONTHLY",
            startDate: "2026-01-01",
            active: false,
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "a2",
            title: "Personal edit",
            baseAmount: "90.00",
            ownershipType: "PERSONAL",
            categoryId: "c2",
            recurrenceType: "MONTHLY",
            startDate: "2026-01-01",
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

    vi.stubGlobal("fetch", fetchMock);

    await createAccount({
      title: "Personal",
      baseAmount: "90.00",
      ownershipType: "PERSONAL",
      categoryId: "c2",
      recurrenceType: "MONTHLY",
      startDate: "2026-01-01",
    });
    await updateAccount({ id: "a2", payload: { title: "Personal edit" } });
    await activateAccount("a2");
    await deactivateAccount("a2");
    await deleteAccount("a2");
    const detail = await getAccountById("a2");
    expect(detail.id).toBe("a2");
  });
});
