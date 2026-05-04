"use client";

import { useEffect, useMemo, useState } from "react";
import { Settings2 } from "lucide-react";
import { SectionCard } from "@/components/shared/data/section-card";
import { StatusBadge } from "@/components/shared/data/status-badge";
import { EmptyState } from "@/components/shared/feedback/empty-state";
import { ErrorState } from "@/components/shared/feedback/error-state";
import { InlineFeedback } from "@/components/shared/feedback/inline-feedback";
import { LoadingState } from "@/components/shared/feedback/loading-state";
import { AppPageContainer } from "@/components/shared/layout/app-page-container";
import { PageHeader } from "@/components/shared/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  FamilyMemberModal,
  FamilyMemberModalMode,
} from "@/features/families/components/family-member-modal";
import {
  AdminRuleBlockReason,
  canChangeMemberRole,
  canManageFamilyAdminActions,
  canRemoveMember,
  isLastActiveAdmin,
  resolveCurrentUserFamilyMember,
} from "@/features/families/admin-rules";
import {
  useCreatePendingFamilyMemberMutation,
  useMemberPermissionsQuery,
  useRemoveFamilyMemberMutation,
  useUpdateMemberPermissionsMutation,
  useUpdateFamilyMemberRoleMutation,
  useMyFamilyMembersQuery,
  useMyFamilyQuery,
} from "@/features/families/hooks";
import { CreatePendingMemberFormValues } from "@/features/families/schema";
import { MemberPermissionsDto } from "@/features/families/types";
import { useAuth } from "@/providers/auth-provider";
import { ApiError, getErrorMessage } from "@/lib/api/error";
import { t } from "@/lib/i18n";
import {
  FamilyMemberDto,
  FamilyMemberRole,
  FamilyMemberStatus,
} from "@/types/domain/families";

function getMemberRoleLabel(role: FamilyMemberRole) {
  return t(`family.role.${role}`);
}

function getMemberRoleTone(role: FamilyMemberRole) {
  return role === "ADMIN" ? "info" : "neutral";
}

function getMemberStatusLabel(status: FamilyMemberStatus) {
  return t(`family.status.${status}`);
}

function getMemberStatusTone(status: FamilyMemberStatus) {
  switch (status) {
    case "PENDING_REGISTRATION":
      return "warning" as const;
    case "REMOVED":
      return "danger" as const;
    default:
      return "success" as const;
  }
}

export default function FamilyPage() {
  const auth = useAuth();
  const familyQuery = useMyFamilyQuery();
  const membersQuery = useMyFamilyMembersQuery();
  const createPendingMemberMutation = useCreatePendingFamilyMemberMutation();
  const updateRoleMutation = useUpdateFamilyMemberRoleMutation();
  const removeMemberMutation = useRemoveFamilyMemberMutation();
  const updateMemberPermissionsMutation = useUpdateMemberPermissionsMutation();

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberModalMode, setMemberModalMode] = useState<FamilyMemberModalMode>("view");
  const [selectedMember, setSelectedMember] = useState<FamilyMemberDto | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "danger"; message: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isLoading = familyQuery.isLoading || membersQuery.isLoading;
  const isError = familyQuery.isError || membersQuery.isError;
  const sortedMembers = useMemo(() => {
    return [...(membersQuery.data ?? [])].sort((a, b) => {
      if (a.role === b.role) {
        return a.name.localeCompare(b.name);
      }
      return a.role === "ADMIN" ? -1 : 1;
    });
  }, [membersQuery.data]);

  const currentUserMember = useMemo(() => {
    return resolveCurrentUserFamilyMember(sortedMembers, auth.session?.user.id);
  }, [auth.session?.user.id, sortedMembers]);

  const canEditFamilyMembers = auth.canEditFamilyAccounts;
  const canCreateMember = canEditFamilyMembers;
  const canManageAdminActions = canManageFamilyAdminActions({
    canEditFamilyAccounts: canEditFamilyMembers,
    currentUserMember,
  });
  const canEditRoleAndPermissions = canManageAdminActions;
  const canRemoveMembers = canManageAdminActions;
  const selectedMemberIsLastAdmin = Boolean(
    selectedMember && isLastActiveAdmin(selectedMember, sortedMembers),
  );

  const memberPermissionsQuery = useMemberPermissionsQuery(
    selectedMember?.id ?? "",
    Boolean(isMemberModalOpen && selectedMember && memberModalMode !== "create"),
  );

  useEffect(() => {
    if (!toastMessage) {
      return;
    }
    const timeoutId = window.setTimeout(() => setToastMessage(null), 2800);
    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  function closeMemberModal() {
    setIsMemberModalOpen(false);
    setSelectedMember(null);
  }

  function showSuccessToast(message: string) {
    setToastMessage(message);
  }

  function openCreateMemberModal() {
    setMemberModalMode("create");
    setSelectedMember(null);
    setFeedback(null);
    setIsMemberModalOpen(true);
  }

  function openMemberModal(member: FamilyMemberDto) {
    setSelectedMember(member);
    setMemberModalMode(canEditRoleAndPermissions ? "edit" : "view");
    setFeedback(null);
    setIsMemberModalOpen(true);
  }

  function getCreateMemberErrorMessage(error: unknown) {
    if (error instanceof ApiError && error.status === 403) {
      return t("family.memberForm.errors.forbidden");
    }
    return getErrorMessage(error, t("family.memberForm.errors.default"));
  }

  function getMemberMutationErrorMessage(error: unknown) {
    if (error instanceof ApiError && error.code === "LAST_FAMILY_ADMIN") {
      return t("family.memberActions.errors.lastAdmin");
    }
    if (error instanceof ApiError && error.status === 403) {
      return t("family.memberActions.errors.forbidden");
    }
    return getErrorMessage(error, t("family.memberActions.errors.default"));
  }

  function getAdminRuleBlockMessage(reason?: AdminRuleBlockReason) {
    if (reason === "LAST_ADMIN") {
      return t("family.memberActions.errors.lastAdmin");
    }
    return t("family.memberActions.errors.forbidden");
  }

  async function handleCreatePendingMember(values: CreatePendingMemberFormValues) {
    try {
      await createPendingMemberMutation.mutateAsync({
        displayName: values.displayName.trim(),
        document: values.document?.trim() || undefined,
        email: values.email?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
      });
      const successMessage = t("family.memberForm.success");
      setFeedback({ tone: "success", message: successMessage });
      showSuccessToast(successMessage);
      closeMemberModal();
    } catch (error) {
      setFeedback({ tone: "danger", message: getCreateMemberErrorMessage(error) });
    }
  }

  async function handleUpdateRole(
    memberId: string,
    memberName: string,
    currentRole: FamilyMemberRole,
    nextRole: FamilyMemberRole,
  ) {
    const currentMember = sortedMembers.find((member) => member.id === memberId);
    if (!currentMember) {
      return;
    }
    const roleRule = canChangeMemberRole({
      canManageAdminActions,
      targetMember: currentMember,
      nextRole,
      members: sortedMembers,
    });
    if (!roleRule.allowed) {
      setFeedback({ tone: "danger", message: getAdminRuleBlockMessage(roleRule.reason) });
      return;
    }

    if (currentRole === nextRole) {
      return;
    }

    const confirmed = window.confirm(
      t("family.memberActions.roleChangeConfirm", {
        values: { name: memberName, role: getMemberRoleLabel(nextRole) },
      }),
    );
    if (!confirmed) {
      return;
    }

    try {
      await updateRoleMutation.mutateAsync({ memberId, role: nextRole });
      const successMessage =
        nextRole === "ADMIN"
          ? t("family.memberActions.rolePromoted")
          : t("family.memberActions.roleDemoted");
      setFeedback({
        tone: "success",
        message: successMessage,
      });
      showSuccessToast(successMessage);
      closeMemberModal();
    } catch (error) {
      setFeedback({ tone: "danger", message: getMemberMutationErrorMessage(error) });
    }
  }

  async function handleUpdatePermissions(values: MemberPermissionsDto) {
    if (!selectedMember) {
      return;
    }
    try {
      await updateMemberPermissionsMutation.mutateAsync({
        memberId: selectedMember.id,
        permissions: values,
      });
      const successMessage = t("family.permissions.success");
      setFeedback({ tone: "success", message: successMessage });
      showSuccessToast(successMessage);
      closeMemberModal();
    } catch (error) {
      setFeedback({ tone: "danger", message: getMemberMutationErrorMessage(error) });
    }
  }

  async function handleRemoveMember(memberId: string, memberName: string) {
    const currentMember = sortedMembers.find((member) => member.id === memberId);
    if (!currentMember) {
      return;
    }

    const removeRule = canRemoveMember({
      canManageAdminActions,
      targetMember: currentMember,
      members: sortedMembers,
    });
    if (!removeRule.allowed) {
      setFeedback({ tone: "danger", message: getAdminRuleBlockMessage(removeRule.reason) });
      return;
    }

    const confirmed = window.confirm(
      t("family.memberActions.removeConfirm", { values: { name: memberName } }),
    );
    if (!confirmed) {
      return;
    }

    try {
      await removeMemberMutation.mutateAsync({ memberId });
      const successMessage = t("family.memberActions.removeSuccess");
      setFeedback({ tone: "success", message: successMessage });
      showSuccessToast(successMessage);
      closeMemberModal();
    } catch (error) {
      setFeedback({ tone: "danger", message: getMemberMutationErrorMessage(error) });
    }
  }

  return (
    <AppPageContainer className="ds-section-gap">
      <PageHeader
        title={t("family.title")}
        description={t("family.description")}
        actions={
          canCreateMember ? (
            <Button onClick={openCreateMemberModal}>{t("family.memberForm.openAction")}</Button>
          ) : undefined
        }
      />

      {feedback ? <InlineFeedback tone={feedback.tone} message={feedback.message} /> : null}
      {auth.isLoadingMyFamilyPermissions ? (
        <InlineFeedback tone="success" message={t("family.permissionsCache.loading")} />
      ) : null}
      {auth.myFamilyPermissionsError ? (
        <InlineFeedback tone="danger" message={t("family.permissionsCache.error")} />
      ) : null}
      {!auth.canEditFamilyAccounts ? (
        <InlineFeedback tone="success" message={t("family.permissionsCache.readOnly")} />
      ) : null}
      {canEditFamilyMembers && !canManageAdminActions ? (
        <InlineFeedback tone="success" message={t("family.memberActions.adminOnlyHint")} />
      ) : null}

      {isLoading ? (
        <LoadingState label={t("states.loading")} />
      ) : isError ? (
        <ErrorState
          title={t("family.loadErrorTitle")}
          description={getErrorMessage(familyQuery.error) || getErrorMessage(membersQuery.error)}
          action={
            <Button
              variant="outline"
              onClick={() => {
                familyQuery.refetch();
                membersQuery.refetch();
              }}
            >
              {t("actions.tryAgain")}
            </Button>
          }
        />
      ) : (
        <SectionCard
          title={familyQuery.data?.name ?? t("common.notAvailable")}
          description={t("family.cardsDescription")}
        >
          {sortedMembers.length === 0 ? (
            <EmptyState
              title={t("family.noMembers")}
              description={t("family.noMembersDescription")}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sortedMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => openMemberModal(member)}
                  className="ds-focus-ring rounded-lg border border-border/70 bg-background p-4 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-foreground">
                        {member.name || t("common.notAvailable")}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {member.email || t("common.notAvailable")}
                      </p>
                    </div>
                    <Settings2 className="size-4 text-muted-foreground" />
                  </div>

                  <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">{t("family.table.phone")}:</span>{" "}
                      {member.phone || t("common.notAvailable")}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <StatusBadge label={getMemberRoleLabel(member.role)} tone={getMemberRoleTone(member.role)} />
                    <StatusBadge
                      label={getMemberStatusLabel(member.status)}
                      tone={getMemberStatusTone(member.status)}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      <FamilyMemberModal
        key={`${memberModalMode}-${selectedMember?.id ?? "create"}-${isMemberModalOpen ? "open" : "closed"}`}
        isOpen={isMemberModalOpen}
        mode={memberModalMode}
        member={selectedMember}
        canEditRoleAndPermissions={canEditRoleAndPermissions}
        canRemoveMember={canRemoveMembers}
        isLastAdmin={selectedMemberIsLastAdmin}
        isSubmittingCreate={createPendingMemberMutation.isPending}
        isSubmittingRole={updateRoleMutation.isPending}
        isSubmittingPermissions={updateMemberPermissionsMutation.isPending}
        isSubmittingRemove={removeMemberMutation.isPending}
        permissionsQuery={{
          isLoading: memberPermissionsQuery.isLoading,
          isError: memberPermissionsQuery.isError,
          error: memberPermissionsQuery.error,
          data: memberPermissionsQuery.data,
          refetch: () => {
            memberPermissionsQuery.refetch();
          },
        }}
        onClose={closeMemberModal}
        onCreateMember={handleCreatePendingMember}
        onUpdateRole={handleUpdateRole}
        onUpdatePermissions={handleUpdatePermissions}
        onRemoveMember={handleRemoveMember}
      />

      {toastMessage ? (
        <div className="fixed bottom-4 right-4 z-[70] max-w-sm rounded-lg border border-emerald-500/30 bg-card px-4 py-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{toastMessage}</p>
        </div>
      ) : null}
    </AppPageContainer>
  );
}
