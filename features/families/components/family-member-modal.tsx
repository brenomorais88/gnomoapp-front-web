"use client";

import { useMemo, useState } from "react";
import { Shield, Trash2, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineFeedback } from "@/components/shared/feedback/inline-feedback";
import { ErrorState } from "@/components/shared/feedback/error-state";
import { LoadingState } from "@/components/shared/feedback/loading-state";
import { StatusBadge } from "@/components/shared/data/status-badge";
import { CreatePendingMemberForm } from "@/features/families/components/create-pending-member-form";
import { MemberPermissionsForm } from "@/features/families/components/member-permissions-form";
import { CreatePendingMemberFormValues } from "@/features/families/schema";
import { MemberPermissionsDto } from "@/features/families/types";
import {
  FamilyMemberDto,
  FamilyMemberRole,
  FamilyMemberStatus,
} from "@/types/domain/families";
import { t } from "@/lib/i18n";
import { getErrorMessage } from "@/lib/api/error";

export type FamilyMemberModalMode = "create" | "edit" | "view";

type FamilyMemberModalProps = {
  isOpen: boolean;
  mode: FamilyMemberModalMode;
  member: FamilyMemberDto | null;
  canEditRoleAndPermissions: boolean;
  canRemoveMember: boolean;
  isLastAdmin: boolean;
  isSubmittingCreate: boolean;
  isSubmittingRole: boolean;
  isSubmittingPermissions: boolean;
  isSubmittingRemove: boolean;
  permissionsQuery: {
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    data?: MemberPermissionsDto;
    refetch: () => void;
  };
  onClose: () => void;
  onCreateMember: (values: CreatePendingMemberFormValues) => Promise<void>;
  onUpdateRole: (
    memberId: string,
    memberName: string,
    currentRole: FamilyMemberRole,
    nextRole: FamilyMemberRole,
  ) => Promise<void>;
  onUpdatePermissions: (values: MemberPermissionsDto) => Promise<void>;
  onRemoveMember: (memberId: string, memberName: string) => Promise<void>;
};

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

function splitMemberName(name: string) {
  const normalized = name.trim();
  if (!normalized) {
    return { firstName: "", lastName: "" };
  }

  const parts = normalized.split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export function FamilyMemberModal({
  isOpen,
  mode,
  member,
  canEditRoleAndPermissions,
  canRemoveMember,
  isLastAdmin,
  isSubmittingCreate,
  isSubmittingRole,
  isSubmittingPermissions,
  isSubmittingRemove,
  permissionsQuery,
  onClose,
  onCreateMember,
  onUpdateRole,
  onUpdatePermissions,
  onRemoveMember,
}: FamilyMemberModalProps) {
  const [roleDraft, setRoleDraft] = useState<FamilyMemberRole>(member?.role ?? "MEMBER");
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";
  const isViewMode = mode === "view";
  const hasMember = Boolean(member);
  const isBusy = isSubmittingRole || isSubmittingPermissions || isSubmittingRemove;

  const title = useMemo(() => {
    if (isCreateMode) {
      return t("family.modal.createTitle");
    }

    if (isEditMode && member) {
      return t("family.modal.editTitle", { values: { name: member.name } });
    }

    return t("family.modal.readTitle");
  }, [isCreateMode, isEditMode, member]);

  const description = useMemo(() => {
    if (isCreateMode) {
      return t("family.modal.createDescription");
    }

    if (isEditMode) {
      return t("family.modal.editDescription");
    }

    return t("family.modal.readDescription");
  }, [isCreateMode, isEditMode]);

  if (!isOpen) {
    return null;
  }

  const fullName = member?.name ?? "";
  const { firstName, lastName } = splitMemberName(fullName);
  const canSubmitRole =
    isEditMode &&
    hasMember &&
    canEditRoleAndPermissions &&
    roleDraft !== member?.role;
  const canToggleAdminRole = isEditMode && hasMember && canEditRoleAndPermissions;
  const shouldDisableAdminDowngrade = member?.role === "ADMIN" && isLastAdmin;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4">
      <button
        type="button"
        className="absolute inset-0"
        aria-label={t("actions.close")}
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border/70 bg-card p-4 shadow-xl sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-border/70 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <Button variant="outline" size="icon" onClick={onClose} aria-label={t("actions.close")}>
            <X className="size-4" />
          </Button>
        </div>

        {isCreateMode ? (
          <div>
            <p className="mb-4 text-sm text-muted-foreground">{t("family.memberForm.pendingHint")}</p>
            <CreatePendingMemberForm
              isSubmitting={isSubmittingCreate}
              onSubmit={onCreateMember}
              onCancel={onClose}
            />
          </div>
        ) : member ? (
          <div className="space-y-4">
            {isViewMode ? (
              <InlineFeedback tone="success" message={t("family.memberActions.readOnlyHint")} />
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border/70 px-3 py-2">
                <p className="text-xs text-muted-foreground">{t("family.modal.fields.firstName")}</p>
                <p className="text-sm font-medium text-foreground">{firstName || t("common.notAvailable")}</p>
              </div>
              <div className="rounded-lg border border-border/70 px-3 py-2">
                <p className="text-xs text-muted-foreground">{t("family.modal.fields.lastName")}</p>
                <p className="text-sm font-medium text-foreground">{lastName || t("common.notAvailable")}</p>
              </div>
              <div className="rounded-lg border border-border/70 px-3 py-2">
                <p className="text-xs text-muted-foreground">{t("family.table.email")}</p>
                <p className="text-sm font-medium text-foreground">
                  {member.email || t("common.notAvailable")}
                </p>
              </div>
              <div className="rounded-lg border border-border/70 px-3 py-2">
                <p className="text-xs text-muted-foreground">{t("family.table.phone")}</p>
                <p className="text-sm font-medium text-foreground">
                  {member.phone || t("common.notAvailable")}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border/70 p-3">
              <p className="text-xs text-muted-foreground">{t("family.table.status")}</p>
              <div className="mt-2">
                <StatusBadge
                  label={getMemberStatusLabel(member.status)}
                  tone={getMemberStatusTone(member.status)}
                />
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-border/70 p-3">
              <p className="text-xs text-muted-foreground">{t("family.table.role")}</p>

              {isEditMode && canEditRoleAndPermissions ? (
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={roleDraft}
                    onChange={(event) => setRoleDraft(event.target.value as FamilyMemberRole)}
                    className="ds-focus-ring h-9 min-w-[200px] rounded-md border border-input bg-background px-3 text-sm text-foreground"
                    disabled={isBusy}
                    aria-label={t("family.table.role")}
                  >
                    <option value="MEMBER">{getMemberRoleLabel("MEMBER")}</option>
                    <option value="ADMIN">{getMemberRoleLabel("ADMIN")}</option>
                  </select>
                  <Button
                    size="sm"
                    onClick={() => onUpdateRole(member.id, member.name, member.role, roleDraft)}
                    disabled={
                      !canSubmitRole ||
                      isSubmittingRole ||
                      (shouldDisableAdminDowngrade && roleDraft === "MEMBER")
                    }
                  >
                    {roleDraft === "ADMIN" ? (
                      <Shield className="size-3.5" />
                    ) : (
                      <UserRound className="size-3.5" />
                    )}
                    {t("family.modal.actions.saveRole")}
                  </Button>
                </div>
              ) : (
                <StatusBadge
                  label={getMemberRoleLabel(member.role)}
                  tone={getMemberRoleTone(member.role)}
                />
              )}

              {shouldDisableAdminDowngrade ? (
                <p className="text-xs text-destructive">{t("family.memberActions.errors.lastAdmin")}</p>
              ) : null}

              {canToggleAdminRole && isEditMode ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onUpdateRole(
                      member.id,
                      member.name,
                      member.role,
                      member.role === "ADMIN" ? "MEMBER" : "ADMIN",
                    )
                  }
                  disabled={isBusy || shouldDisableAdminDowngrade}
                >
                  {member.role === "ADMIN"
                    ? t("family.memberActions.demote")
                    : t("family.memberActions.promote")}
                </Button>
              ) : null}
            </div>

            <div className="space-y-2 rounded-lg border border-border/70 p-3">
              <p className="text-xs text-muted-foreground">{t("family.permissions.title", { values: { name: member.name } })}</p>

              {permissionsQuery.isLoading ? (
                <LoadingState label={t("family.permissions.loading")} className="min-h-24" />
              ) : permissionsQuery.isError ? (
                <ErrorState
                  title={t("family.permissions.loadErrorTitle")}
                  description={getErrorMessage(permissionsQuery.error)}
                  action={
                    <Button variant="outline" onClick={permissionsQuery.refetch}>
                      {t("actions.tryAgain")}
                    </Button>
                  }
                />
              ) : permissionsQuery.data ? (
                <MemberPermissionsForm
                  initialValues={permissionsQuery.data}
                  isSubmitting={isSubmittingPermissions}
                  readOnly={!isEditMode || !canEditRoleAndPermissions}
                  onSubmit={isEditMode && canEditRoleAndPermissions ? onUpdatePermissions : undefined}
                />
              ) : null}
            </div>

            {isEditMode && canRemoveMember ? (
              <div className="flex flex-wrap justify-between gap-2 border-t border-border/70 pt-4">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onRemoveMember(member.id, member.name)}
                  disabled={isSubmittingRemove || shouldDisableAdminDowngrade}
                >
                  <Trash2 className="size-3.5" />
                  {t("family.memberActions.remove")}
                </Button>
                {shouldDisableAdminDowngrade ? (
                  <InlineFeedback tone="danger" message={t("family.memberActions.errors.lastAdmin")} />
                ) : null}
              </div>
            ) : (
              <div className="flex justify-end border-t border-border/70 pt-4">
                <Button variant="outline" onClick={onClose}>
                  {t("actions.close")}
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
