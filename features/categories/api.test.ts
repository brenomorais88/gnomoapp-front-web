import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  listCategories,
  updateCategory,
} from "./api";

describe("categories api", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8081";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lists categories and maps scope", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: [
              { id: "c1", name: "Casa", scope: "FAMILY" },
              { id: "c2", name: "Pessoal", scope: "PERSONAL" },
            ],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      ),
    );

    const result = await listCategories();
    expect(result[0].scope).toBe("FAMILY");
    expect(result[1].scope).toBe("PERSONAL");
  });

  it("loads category detail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: "c3", name: "Global", scope: "GLOBAL" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    const result = await getCategoryById("c3");
    expect(result).toMatchObject({ id: "c3", scope: "GLOBAL" });
  });

  it("creates, updates and deletes category", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "c4", name: "Nova", scope: "FAMILY" }), {
          status: 201,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "c4", name: "Nova 2", scope: "FAMILY" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(null, {
          status: 204,
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const created = await createCategory({ name: "Nova" });
    expect(created.scope).toBe("FAMILY");

    const updated = await updateCategory({
      id: "c4",
      payload: { name: "Nova 2" },
    });
    expect(updated.name).toBe("Nova 2");

    await deleteCategory("c4");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
