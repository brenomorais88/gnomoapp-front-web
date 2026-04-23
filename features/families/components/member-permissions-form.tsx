"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { MemberPermissionsDto } from "@/features/families/types";
import { t } from "@/lib/i18n";

type PermissionField = {
  key: keyof MemberPermissionsDto;
  labelKey: string;
  descriptionKey: string;
};

const permissionFields: PermissionField[] = [
  {
    key: "canViewFamilyAccounts",
    labelKey: "family.permissions.fields.canViewFamilyAccounts.label",
    descriptionKey: "family.permissions.fields.canViewFamilyAccounts.description",
  },
  {
    key: "canCreateFamilyAccounts",
    labelKey: "family.permissions.fields.canCreateFamilyAccounts.label",
    descriptionKey: "family.permissions.fields.canCreateFamilyAccounts.description",
  },
  {
    key: "canEditFamilyAccounts",
    labelKey: "family.permissions.fields.canEditFamilyAccounts.label",
    descriptionKey: "family.permissions.fields.canEditFamilyAccounts.description",
  },
  {
    key: "canDeleteFamilyAccounts",
    labelKey: "family.permissions.fields.canDeleteFamilyAccounts.label",
    descriptionKey: "family.permissions.fields.canDeleteFamilyAccounts.description",
  },
  {
    key: "canMarkFamilyAccountsPaid",
    labelKey: "family.permissions.fields.canMarkFamilyAccountsPaid.label",
    descriptionKey: "family.permissions.fields.canMarkFamilyAccountsPaid.description",
  },
  {
    key: "canManageCategories",
    labelKey: "family.permissions.fields.canManageCategories.label",
    descriptionKey: "family.permissions.fields.canManageCategories.description",
  },
  {
    key: "canInviteMembers",
    labelKey: "family.permissions.fields.canInviteMembers.label",
    descriptionKey: "family.permissions.fields.canInviteMembers.description",
  },
  {
    key: "canManageMembers",
    labelKey: "family.permissions.fields.canManageMembers.label",
    descriptionKey: "family.permissions.fields.canManageMembers.description",
  },
  {
    key: "canViewOtherPersonalAccounts",
    labelKey: "family.permissions.fields.canViewOtherPersonalAccounts.label",
    descriptionKey: "family.permissions.fields.canViewOtherPersonalAccounts.description",
  },
  {
    key: "canEditOtherPersonalAccounts",
    labelKey: "family.permissions.fields.canEditOtherPersonalAccounts.label",
    descriptionKey: "family.permissions.fields.canEditOtherPersonalAccounts.description",
  },
];

type MemberPermissionsFormProps = {
  initialValues: MemberPermissionsDto;
  isSubmitting?: boolean;
  onSubmit: (values: MemberPermissionsDto) => Promise<void>;
  onCancel: () => void;
};

export function MemberPermissionsForm({
  initialValues,
  isSubmitting,
  onSubmit,
  onCancel,
}: MemberPermissionsFormProps) {
  const form = useForm<MemberPermissionsDto>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <div className="space-y-3">
        {permissionFields.map((field) => (
          <label
            key={field.key}
            className="flex items-start gap-3 rounded-lg border border-border/70 bg-background px-3 py-2"
          >
            <input
              type="checkbox"
              className="mt-1 size-4 rounded border-input"
              {...form.register(field.key)}
            />
            <span>
              <span className="block text-sm font-medium text-foreground">
                {t(field.labelKey)}
              </span>
              <span className="block text-xs text-muted-foreground">
                {t(field.descriptionKey)}
              </span>
            </span>
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t("family.permissions.submitting")
            : t("family.permissions.submit")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {t("actions.cancel")}
        </Button>
      </div>
    </form>
  );
}
