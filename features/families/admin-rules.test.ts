import { describe, expect, it } from "vitest";
import {
  canChangeMemberRole,
  canManageFamilyAdminActions,
  canRemoveMember,
  countActiveAdmins,
  isLastActiveAdmin,
  resolveCurrentUserFamilyMember,
} from "@/features/families/admin-rules";
import { FamilyMemberDto } from "@/types/domain/families";

const membersFixture: FamilyMemberDto[] = [
  {
    id: "m1",
    userId: "u1",
    name: "Admin One",
    role: "ADMIN",
    status: "ACTIVE",
  },
  {
    id: "m2",
    userId: "u2",
    name: "Admin Two",
    role: "ADMIN",
    status: "ACTIVE",
  },
  {
    id: "m3",
    userId: "u3",
    name: "Member One",
    role: "MEMBER",
    status: "ACTIVE",
  },
];

describe("family admin rules", () => {
  it("resolves current user member by userId", () => {
    const current = resolveCurrentUserFamilyMember(membersFixture, "u2");
    expect(current?.id).toBe("m2");
  });

  it("counts only active admins", () => {
    const members = [
      ...membersFixture,
      { id: "m4", name: "Removed Admin", role: "ADMIN", status: "REMOVED" as const },
    ];
    expect(countActiveAdmins(members)).toBe(2);
  });

  it("blocks demotion when target is last active admin", () => {
    const singleAdminMembers: FamilyMemberDto[] = [
      { id: "m1", userId: "u1", name: "Admin", role: "ADMIN", status: "ACTIVE" },
      { id: "m3", userId: "u3", name: "Member", role: "MEMBER", status: "ACTIVE" },
    ];

    const result = canChangeMemberRole({
      canManageAdminActions: true,
      targetMember: singleAdminMembers[0],
      nextRole: "MEMBER",
      members: singleAdminMembers,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("LAST_ADMIN");
    expect(isLastActiveAdmin(singleAdminMembers[0], singleAdminMembers)).toBe(true);
  });

  it("allows admin to remove another admin when more than one active admin exists", () => {
    const result = canRemoveMember({
      canManageAdminActions: true,
      targetMember: membersFixture[1],
      members: membersFixture,
    });
    expect(result.allowed).toBe(true);
  });

  it("blocks management for non-admin actors", () => {
    const canManage = canManageFamilyAdminActions({
      canEditFamilyAccounts: true,
      currentUserMember: membersFixture[2],
    });
    expect(canManage).toBe(false);
  });

  it("allows managing pending-registration members", () => {
    const members: FamilyMemberDto[] = [
      { id: "a1", userId: "u1", name: "Admin", role: "ADMIN", status: "ACTIVE" },
      {
        id: "p1",
        userId: undefined,
        name: "Dependente",
        role: "MEMBER",
        status: "PENDING_REGISTRATION",
      },
    ];

    const roleResult = canChangeMemberRole({
      canManageAdminActions: true,
      targetMember: members[1],
      nextRole: "ADMIN",
      members,
    });

    const removeResult = canRemoveMember({
      canManageAdminActions: true,
      targetMember: members[1],
      members,
    });

    expect(roleResult.allowed).toBe(true);
    expect(removeResult.allowed).toBe(true);
  });
});
