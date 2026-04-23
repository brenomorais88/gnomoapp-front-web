import { apiRequest } from "@/lib/api/client";
import { isRecord, parseCollection, parseEntity } from "@/lib/api/parsers";
import {
  CreateFamilyInput,
  CreateFamilyResponse,
  CreatePendingFamilyMemberInput,
  CreatePendingFamilyMemberResponse,
  FamilyMembersResponse,
  MemberPermissionsDto,
  RemoveFamilyMemberInput,
  UpdateMemberPermissionsInput,
  UpdateFamilyMemberRoleInput,
} from "@/features/families/types";
import {
  FamilyMemberDto,
  FamilyMemberRole,
  FamilyMemberStatus,
  FamilySummaryDto,
} from "@/types/domain/families";

const FAMILIES_ENDPOINT = "/families";

export async function getMyFamily() {
  const response = await apiRequest<unknown>(`${FAMILIES_ENDPOINT}/me`);
  return parseEntity<FamilySummaryDto>(response);
}

export async function createFamily(payload: CreateFamilyInput) {
  const response = await apiRequest<unknown>(FAMILIES_ENDPOINT, {
    method: "POST",
    body: payload,
  });

  return parseEntity<CreateFamilyResponse>(response);
}

function normalizeRole(value: unknown): FamilyMemberRole {
  const role = String(value ?? "").toUpperCase();
  if (role === "ADMIN") {
    return "ADMIN";
  }

  return "MEMBER";
}

function normalizeStatus(value: unknown): FamilyMemberStatus {
  const status = String(value ?? "").toUpperCase();

  if (status === "PENDING_REGISTRATION") {
    return "PENDING_REGISTRATION";
  }

  if (status === "REMOVED") {
    return "REMOVED";
  }

  return "ACTIVE";
}

function mapFamilyMember(payload: unknown): FamilyMemberDto {
  if (!isRecord(payload)) {
    return {
      id: "",
      name: "",
      role: "MEMBER",
      status: "ACTIVE",
    };
  }

  const firstName = payload.firstName ? String(payload.firstName) : "";
  const lastName = payload.lastName ? String(payload.lastName) : "";
  const joinedName = [firstName, lastName].filter(Boolean).join(" ").trim();

  return {
    id: String(payload.id ?? payload.userId ?? ""),
    name: String(payload.name ?? payload.fullName ?? joinedName),
    email: payload.email ? String(payload.email) : undefined,
    role: normalizeRole(payload.role),
    status: normalizeStatus(payload.status),
  };
}

export async function getMyFamilyMembers() {
  const response = await apiRequest<unknown>(`${FAMILIES_ENDPOINT}/me/members`);
  const members = parseCollection<unknown>(response).map(mapFamilyMember);
  return members as FamilyMembersResponse;
}

export async function createPendingFamilyMember(
  payload: CreatePendingFamilyMemberInput,
) {
  const response = await apiRequest<unknown>(`${FAMILIES_ENDPOINT}/current/members`, {
    method: "POST",
    body: payload,
  });

  return mapFamilyMember(parseEntity<unknown>(response)) as CreatePendingFamilyMemberResponse;
}

export async function updateFamilyMemberRole({
  memberId,
  role,
}: UpdateFamilyMemberRoleInput) {
  const response = await apiRequest<unknown>(
    `${FAMILIES_ENDPOINT}/current/members/${memberId}/role`,
    {
      method: "PATCH",
      body: { role },
    },
  );

  return mapFamilyMember(parseEntity<unknown>(response));
}

export async function removeFamilyMember({ memberId }: RemoveFamilyMemberInput) {
  return apiRequest<void>(`${FAMILIES_ENDPOINT}/current/members/${memberId}`, {
    method: "DELETE",
  });
}

const memberPermissionKeys: Array<keyof MemberPermissionsDto> = [
  "canViewFamilyAccounts",
  "canCreateFamilyAccounts",
  "canEditFamilyAccounts",
  "canDeleteFamilyAccounts",
  "canMarkFamilyAccountsPaid",
  "canManageCategories",
  "canInviteMembers",
  "canManageMembers",
  "canViewOtherPersonalAccounts",
  "canEditOtherPersonalAccounts",
];

function mapMemberPermissions(payload: unknown): MemberPermissionsDto {
  const source = parseEntity<unknown>(payload);
  const record = isRecord(source) ? source : {};

  return memberPermissionKeys.reduce<MemberPermissionsDto>((acc, key) => {
    acc[key] = Boolean(record[key]);
    return acc;
  }, {
    canViewFamilyAccounts: false,
    canCreateFamilyAccounts: false,
    canEditFamilyAccounts: false,
    canDeleteFamilyAccounts: false,
    canMarkFamilyAccountsPaid: false,
    canManageCategories: false,
    canInviteMembers: false,
    canManageMembers: false,
    canViewOtherPersonalAccounts: false,
    canEditOtherPersonalAccounts: false,
  });
}

export async function getMemberPermissions(memberId: string) {
  const response = await apiRequest<unknown>(
    `${FAMILIES_ENDPOINT}/current/members/${memberId}/permissions`,
  );
  return mapMemberPermissions(response);
}

export async function updateMemberPermissions({
  memberId,
  permissions,
}: UpdateMemberPermissionsInput) {
  const response = await apiRequest<unknown>(
    `${FAMILIES_ENDPOINT}/current/members/${memberId}/permissions`,
    {
      method: "PUT",
      body: permissions,
    },
  );
  return mapMemberPermissions(response);
}
