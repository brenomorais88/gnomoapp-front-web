"use client";

import { useApiQuery } from "@/hooks/api/use-api-query";
import { useApiMutation } from "@/hooks/api/use-api-mutation";
import {
  createPendingFamilyMember,
  getMemberPermissions,
  getMyFamily,
  getMyFamilyMembers,
  removeFamilyMember,
  updateMemberPermissions,
  updateFamilyMemberRole,
} from "@/features/families/api";
import { queryKeys } from "@/lib/query-keys";
import {
  CreatePendingFamilyMemberInput,
  RemoveFamilyMemberInput,
  UpdateMemberPermissionsInput,
  UpdateFamilyMemberRoleInput,
} from "@/features/families/types";

export function useMyFamilyQuery(enabled = true) {
  return useApiQuery({
    queryKey: queryKeys.families.me(),
    queryFn: getMyFamily,
    enabled,
  });
}

export function useMyFamilyMembersQuery(enabled = true) {
  return useApiQuery({
    queryKey: queryKeys.families.members("me"),
    queryFn: getMyFamilyMembers,
    enabled,
  });
}

export function useCreatePendingFamilyMemberMutation() {
  return useApiMutation({
    mutationFn: (payload: CreatePendingFamilyMemberInput) =>
      createPendingFamilyMember(payload),
    invalidateQueryKeys: [queryKeys.families.members("me"), queryKeys.families.me()],
  });
}

export function useUpdateFamilyMemberRoleMutation() {
  return useApiMutation({
    mutationFn: (payload: UpdateFamilyMemberRoleInput) =>
      updateFamilyMemberRole(payload),
    invalidateQueryKeys: [queryKeys.families.members("me"), queryKeys.families.root],
  });
}

export function useRemoveFamilyMemberMutation() {
  return useApiMutation({
    mutationFn: (payload: RemoveFamilyMemberInput) => removeFamilyMember(payload),
    invalidateQueryKeys: [queryKeys.families.members("me"), queryKeys.families.root],
  });
}

export function useMemberPermissionsQuery(memberId: string, enabled = true) {
  return useApiQuery({
    queryKey: queryKeys.families.memberPermissions(memberId),
    queryFn: () => getMemberPermissions(memberId),
    enabled: enabled && Boolean(memberId),
  });
}

export function useUpdateMemberPermissionsMutation() {
  return useApiMutation({
    mutationFn: (payload: UpdateMemberPermissionsInput) =>
      updateMemberPermissions(payload),
    invalidateQueryKeys: [queryKeys.families.members("me"), queryKeys.families.root],
  });
}
