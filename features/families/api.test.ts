import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createFamily,
  createPendingFamilyMember,
  getCurrentUserFamilyPermissions,
  getMemberPermissions,
  getMyFamily,
  getMyFamilyMembers,
  removeFamilyMember,
  updateMemberPermissions,
  updateFamilyMemberRole,
} from "./api";

describe("families api", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8081";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the current family from /families/me", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: "f1", name: "Familia Silva" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    const result = await getMyFamily();
    expect(result).toEqual({ id: "f1", name: "Familia Silva" });
  });

  it("creates a family using POST /families", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "f2", name: "Casa Nova" }), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await createFamily({ name: "Casa Nova" });

    expect(result).toEqual({ id: "f2", name: "Casa Nova" });
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/families");
    expect((options as RequestInit).method).toBe("POST");
    expect((options as RequestInit).body).toContain("\"name\":\"Casa Nova\"");
  });

  it("maps family members role and status from /families/me/members", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: [
              {
                id: "m1",
                firstName: "Ana",
                lastName: "Silva",
                role: "ADMIN",
                status: "PENDING_REGISTRATION",
                email: "ana@email.com",
              },
              {
                id: "m2",
                name: "Bruno",
                role: "MEMBER",
                status: "ACTIVE",
              },
              {
                id: "m3",
                name: "Carla",
                role: "MEMBER",
                status: "REMOVED",
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

    const result = await getMyFamilyMembers();

    expect(result).toEqual([
      {
        id: "m1",
        familyMemberId: "m1",
        userId: undefined,
        name: "Ana Silva",
        email: "ana@email.com",
        phone: undefined,
        role: "ADMIN",
        status: "PENDING_REGISTRATION",
      },
      {
        id: "m2",
        familyMemberId: "m2",
        userId: undefined,
        name: "Bruno",
        email: undefined,
        phone: undefined,
        role: "MEMBER",
        status: "ACTIVE",
      },
      {
        id: "m3",
        familyMemberId: "m3",
        userId: undefined,
        name: "Carla",
        email: undefined,
        phone: undefined,
        role: "MEMBER",
        status: "REMOVED",
      },
    ]);
  });

  it("maps pending members with nullable user fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: [
              {
                id: "m-pending-1",
                userId: null,
                name: "Dependente",
                role: "MEMBER",
                status: "PENDING_REGISTRATION",
                email: null,
                phone: null,
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

    const result = await getMyFamilyMembers();

    expect(result).toEqual([
      {
        id: "m-pending-1",
        familyMemberId: "m-pending-1",
        userId: undefined,
        name: "Dependente",
        email: undefined,
        phone: undefined,
        role: "MEMBER",
        status: "PENDING_REGISTRATION",
      },
    ]);
  });

  it("creates pending member in current family", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: "m4",
            name: "Convidado",
            role: "MEMBER",
            status: "PENDING_REGISTRATION",
            email: "convidado@email.com",
          },
        }),
        {
          status: 201,
          headers: { "content-type": "application/json" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await createPendingFamilyMember({
      displayName: "Convidado",
      email: "convidado@email.com",
    });

    expect(result).toEqual({
      id: "m4",
      familyMemberId: "m4",
      userId: undefined,
      name: "Convidado",
      email: "convidado@email.com",
      phone: undefined,
      role: "MEMBER",
      status: "PENDING_REGISTRATION",
    });
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/families/current/members");
    expect((options as RequestInit).method).toBe("POST");
  });

  it("updates member role using PATCH endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "m5",
          name: "Carlos",
          role: "ADMIN",
          status: "ACTIVE",
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await updateFamilyMemberRole({
      memberId: "m5",
      role: "ADMIN",
    });

    expect(result.role).toBe("ADMIN");
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/families/current/members/m5/role");
    expect((options as RequestInit).method).toBe("PATCH");
  });

  it("removes member using DELETE endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await removeFamilyMember({ memberId: "m6" });

    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/families/current/members/m6");
    expect((options as RequestInit).method).toBe("DELETE");
  });

  it("loads member permissions from GET endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            canViewFamilyAccounts: true,
            canCreateFamilyAccounts: false,
            canEditFamilyAccounts: true,
            canDeleteFamilyAccounts: false,
            canMarkFamilyAccountsPaid: true,
            canManageCategories: false,
            canInviteMembers: true,
            canManageMembers: false,
            canViewOtherPersonalAccounts: true,
            canEditOtherPersonalAccounts: false,
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      ),
    );

    const result = await getMemberPermissions("m7");
    expect(result.canViewFamilyAccounts).toBe(true);
    expect(result.canEditOtherPersonalAccounts).toBe(false);
  });

  it("loads current user family permissions from dedicated endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            canViewFamilyAccounts: true,
            canCreateFamilyAccounts: false,
            canEditFamilyAccounts: true,
            canDeleteFamilyAccounts: false,
            canMarkFamilyAccountsPaid: true,
            canManageCategories: false,
            canInviteMembers: true,
            canManageMembers: false,
            canViewOtherPersonalAccounts: false,
            canEditOtherPersonalAccounts: false,
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      ),
    );

    const result = await getCurrentUserFamilyPermissions();

    expect(result.canEditFamilyAccounts).toBe(true);
    expect(result.canManageMembers).toBe(false);
  });

  it("updates member permissions using PUT endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            canViewFamilyAccounts: true,
            canCreateFamilyAccounts: true,
            canEditFamilyAccounts: true,
            canDeleteFamilyAccounts: true,
            canMarkFamilyAccountsPaid: true,
            canManageCategories: true,
            canInviteMembers: true,
            canManageMembers: true,
            canViewOtherPersonalAccounts: false,
            canEditOtherPersonalAccounts: false,
          },
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await updateMemberPermissions({
      memberId: "m8",
      permissions: {
        canViewFamilyAccounts: true,
        canCreateFamilyAccounts: true,
        canEditFamilyAccounts: true,
        canDeleteFamilyAccounts: true,
        canMarkFamilyAccountsPaid: true,
        canManageCategories: true,
        canInviteMembers: true,
        canManageMembers: true,
        canViewOtherPersonalAccounts: false,
        canEditOtherPersonalAccounts: false,
      },
    });

    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/families/current/members/m8/permissions");
    expect((options as RequestInit).method).toBe("PUT");
  });
});
