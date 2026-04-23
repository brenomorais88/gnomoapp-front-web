"use client";

import { useEffect, useMemo, useState } from "react";
import { Settings2, Shield, Trash2, UserRound } from "lucide-react";
import { DataTable } from "@/components/shared/data/data-table";
import { SectionCard } from "@/components/shared/data/section-card";
import { StatusBadge } from "@/components/shared/data/status-badge";
import { EmptyState } from "@/components/shared/feedback/empty-state";
import { ErrorState } from "@/components/shared/feedback/error-state";
import { InlineFeedback } from "@/components/shared/feedback/inline-feedback";
import { LoadingState } from "@/components/shared/feedback/loading-state";
import { AppPageContainer } from "@/components/shared/layout/app-page-container";
import { PageHeader } from "@/components/shared/layout/page-header";
import { Button } from "@/components/ui/button";
import { CreatePendingMemberForm } from "@/features/families/components/create-pending-member-form";
import { MemberPermissionsForm } from "@/features/families/components/member-permissions-form";
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
import { useAuthorization } from "@/hooks/auth/use-authorization";
import { ApiError, getErrorMessage } from "@/lib/api/error";
import { t } from "@/lib/i18n";
import { MemberPermissionsDto } from "@/features/families/types";
import { getNextFamilyMemberRole } from "@/features/families/member-management";
import {
  FamilyMemberRole,
  FamilyMemberStatus,
  FamilyMemberDto,
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
  const authorization = useAuthorization();
  const familyQuery = useMyFamilyQuery();
  const membersQuery = useMyFamilyMembersQuery();
  const createPendingMemberMutation = useCreatePendingFamilyMemberMutation();
  const updateRoleMutation = useUpdateFamilyMemberRoleMutation();
  const removeMemberMutation = useRemoveFamilyMemberMutation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMemberDto | null>(null);
  const [isPermissionsEditorOpen, setIsPermissionsEditorOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "danger"; message: string } | null>(null);
  const memberPermissionsQuery = useMemberPermissionsQuery(
    selectedMember?.id ?? "",
    Boolean(selectedMember?.id && isPermissionsEditorOpen),
  );
  const updateMemberPermissionsMutation = useUpdateMemberPermissionsMutation();

  const isLoading = familyQuery.isLoading || membersQuery.isLoading;
  const isError = familyQuery.isError || membersQuery.isError;
  const canCreateMember = authorization.canInviteMembers;
  const canUpdateMemberRole = authorization.canManageMembers;
  const canRemoveMember = authorization.canManageMembers;
  const canManageMemberPermissions = authorization.canManageMemberPermissions;
  const canManageMembers = canUpdateMemberRole || canRemoveMember;
  const canOpenMemberManagement = canManageMembers || canManageMemberPermissions;

  const sortedMembers = useMemo(() => {
    return [...(membersQuery.data ?? [])].sort((a, b) => {
      if (a.role === b.role) {
        return a.name.localeCompare(b.name);
      }

      return a.role === "ADMIN" ? -1 : 1;
    });
  }, [membersQuery.data]);

  useEffect(() => {
    if (!selectedMember) {
      return;
    }

    const latestMember = sortedMembers.find((member) => member.id === selectedMember.id);
    if (!latestMember) {
      setSelectedMember(null);
      setIsPermissionsEditorOpen(false);
      return;
    }

    setSelectedMember(latestMember);
  }, [selectedMember, sortedMembers]);

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

  async function handleCreatePendingMember(values: CreatePendingMemberFormValues) {
    try {
      await createPendingMemberMutation.mutateAsync({
        displayName: values.displayName.trim(),
        document: values.document?.trim() || undefined,
        email: values.email?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
      });
      setFeedback({
        tone: "success",
        message: t("family.memberForm.success"),
      });
      setIsCreateOpen(false);
    } catch (error) {
      setFeedback({
        tone: "danger",
        message: getCreateMemberErrorMessage(error),
      });
    }
  }

  async function handleToggleRole(memberId: string, memberName: string, currentRole: FamilyMemberRole) {
    const nextRole = getNextFamilyMemberRole(currentRole);
    const confirmed = window.confirm(
      t("family.memberActions.roleChangeConfirm", {
        values: {
          name: memberName,
          role: getMemberRoleLabel(nextRole),
        },
      }),
    );

    if (!confirmed) {
      return;
    }

    try {
      await updateRoleMutation.mutateAsync({
        memberId,
        role: nextRole,
      });
      setFeedback({
        tone: "success",
        message:
          nextRole === "ADMIN"
            ? t("family.memberActions.rolePromoted")
            : t("family.memberActions.roleDemoted"),
      });
    } catch (error) {
      setFeedback({
        tone: "danger",
        message: getMemberMutationErrorMessage(error),
      });
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
      setFeedback({
        tone: "success",
        message: t("family.permissions.success"),
      });
    } catch (error) {
      setFeedback({
        tone: "danger",
        message: getMemberMutationErrorMessage(error),
      });
    }
  }

  async function handleRemoveMember(memberId: string, memberName: string) {
    const confirmed = window.confirm(
      t("family.memberActions.removeConfirm", { values: { name: memberName } }),
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeMemberMutation.mutateAsync({ memberId });
      if (selectedMember?.id === memberId) {
        setSelectedMember(null);
        setIsPermissionsEditorOpen(false);
      }
      setFeedback({
        tone: "success",
        message: t("family.memberActions.removeSuccess"),
      });
    } catch (error) {
      setFeedback({
        tone: "danger",
        message: getMemberMutationErrorMessage(error),
      });
    }
  }

  return (
    <AppPageContainer className="ds-section-gap">
      <PageHeader
        title={t("family.title")}
        description={t("family.description")}
        actions={
          canCreateMember ? (
            <Button
              onClick={() => {
                setIsCreateOpen(true);
                setFeedback(null);
              }}
            >
              {t("family.memberForm.openAction")}
            </Button>
          ) : undefined
        }
      />

      {feedback ? (
        <InlineFeedback tone={feedback.tone} message={feedback.message} />
      ) : null}

      {isLoading ? (
        <LoadingState label={t("states.loading")} />
      ) : isError ? (
        <ErrorState
          title={t("family.loadErrorTitle")}
          description={
            getErrorMessage(familyQuery.error) || getErrorMessage(membersQuery.error)
          }
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
        <>
          {canCreateMember && isCreateOpen ? (
            <SectionCard
              title={t("family.memberForm.title")}
              description={t("family.memberForm.description")}
            >
              <p className="mb-4 text-sm text-muted-foreground">
                {t("family.memberForm.pendingHint")}
              </p>
              <CreatePendingMemberForm
                isSubmitting={createPendingMemberMutation.isPending}
                onSubmit={handleCreatePendingMember}
                onCancel={() => setIsCreateOpen(false)}
              />
            </SectionCard>
          ) : null}

          {selectedMember ? (
            <SectionCard
              title={t("family.permissions.title", {
                values: { name: selectedMember.name },
              })}
              description={t("family.memberActions.panelDescription")}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedMember(null);
                    setIsPermissionsEditorOpen(false);
                  }}
                >
                  {t("actions.close")}
                </Button>
              }
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border/70 px-3 py-2">
                  <p className="text-xs text-muted-foreground">{t("family.table.name")}</p>
                  <p className="text-sm font-medium text-foreground">{selectedMember.name}</p>
                </div>
                <div className="rounded-lg border border-border/70 px-3 py-2">
                  <p className="text-xs text-muted-foreground">{t("family.table.email")}</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedMember.email || t("common.notAvailable")}
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 px-3 py-2">
                  <p className="text-xs text-muted-foreground">{t("family.table.role")}</p>
                  <div className="mt-1">
                    <StatusBadge
                      label={getMemberRoleLabel(selectedMember.role)}
                      tone={getMemberRoleTone(selectedMember.role)}
                    />
                  </div>
                </div>
                <div className="rounded-lg border border-border/70 px-3 py-2">
                  <p className="text-xs text-muted-foreground">{t("family.table.status")}</p>
                  <div className="mt-1">
                    <StatusBadge
                      label={getMemberStatusLabel(selectedMember.status)}
                      tone={getMemberStatusTone(selectedMember.status)}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {canUpdateMemberRole ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleToggleRole(selectedMember.id, selectedMember.name, selectedMember.role)
                    }
                    disabled={
                      updateRoleMutation.isPending ||
                      removeMemberMutation.isPending ||
                      updateMemberPermissionsMutation.isPending
                    }
                  >
                    {selectedMember.role === "ADMIN" ? (
                      <UserRound className="size-3.5" />
                    ) : (
                      <Shield className="size-3.5" />
                    )}
                    {selectedMember.role === "ADMIN"
                      ? t("family.memberActions.demote")
                      : t("family.memberActions.promote")}
                  </Button>
                ) : null}

                {canManageMemberPermissions ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsPermissionsEditorOpen((current) => !current)}
                    disabled={
                      updateRoleMutation.isPending ||
                      removeMemberMutation.isPending ||
                      updateMemberPermissionsMutation.isPending
                    }
                  >
                    {t("family.permissions.openAction")}
                  </Button>
                ) : null}

                {canRemoveMember ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveMember(selectedMember.id, selectedMember.name)}
                    disabled={
                      updateRoleMutation.isPending ||
                      removeMemberMutation.isPending ||
                      updateMemberPermissionsMutation.isPending
                    }
                  >
                    <Trash2 className="size-3.5" />
                    {t("family.memberActions.remove")}
                  </Button>
                ) : null}
              </div>

              {canManageMemberPermissions && isPermissionsEditorOpen ? (
                <div className="mt-4 border-t border-border/70 pt-4">
                  {memberPermissionsQuery.isLoading ? (
                    <LoadingState label={t("family.permissions.loading")} className="min-h-24" />
                  ) : memberPermissionsQuery.isError ? (
                    <ErrorState
                      title={t("family.permissions.loadErrorTitle")}
                      description={getErrorMessage(memberPermissionsQuery.error)}
                      action={
                        <Button
                          variant="outline"
                          onClick={() => memberPermissionsQuery.refetch()}
                        >
                          {t("actions.tryAgain")}
                        </Button>
                      }
                    />
                  ) : memberPermissionsQuery.data ? (
                    <MemberPermissionsForm
                      initialValues={memberPermissionsQuery.data}
                      isSubmitting={updateMemberPermissionsMutation.isPending}
                      onSubmit={handleUpdatePermissions}
                      onCancel={() => setIsPermissionsEditorOpen(false)}
                    />
                  ) : null}
                </div>
              ) : null}
            </SectionCard>
          ) : null}

          <SectionCard
            title={familyQuery.data?.name ?? t("common.notAvailable")}
            description={t("family.membersDescription")}
          >
            <p className="text-sm text-muted-foreground">
              {t("family.description")}
            </p>
          </SectionCard>

          <SectionCard
            title={t("family.membersTitle")}
            description={t("family.membersDescription")}
          >
            {sortedMembers.length === 0 ? (
              <EmptyState
                title={t("family.noMembers")}
                description={t("family.noMembersDescription")}
              />
            ) : (
              <DataTable>
                <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">{t("family.table.name")}</th>
                    <th className="px-4 py-3 font-medium">{t("family.table.email")}</th>
                    <th className="px-4 py-3 font-medium">{t("family.table.role")}</th>
                    <th className="px-4 py-3 font-medium">{t("family.table.status")}</th>
                    {canOpenMemberManagement ? (
                      <th className="px-4 py-3 text-right font-medium">
                        {t("family.table.actions")}
                      </th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {sortedMembers.map((member) => (
                    <tr key={member.id} className="border-t border-border/70">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {member.name || t("common.notAvailable")}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {member.email || t("common.notAvailable")}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          label={getMemberRoleLabel(member.role)}
                          tone={getMemberRoleTone(member.role)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          label={getMemberStatusLabel(member.status)}
                          tone={getMemberStatusTone(member.status)}
                        />
                      </td>
                      {canOpenMemberManagement ? (
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant={selectedMember?.id === member.id ? "default" : "outline"}
                              onClick={() => {
                                setSelectedMember(member);
                                setIsPermissionsEditorOpen(false);
                                setFeedback(null);
                              }}
                              disabled={
                                updateMemberPermissionsMutation.isPending ||
                                updateRoleMutation.isPending ||
                                removeMemberMutation.isPending
                              }
                            >
                              <Settings2 className="size-3.5" />
                              {t("family.memberActions.manage")}
                            </Button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            )}
          </SectionCard>
        </>
      )}
    </AppPageContainer>
  );
}
