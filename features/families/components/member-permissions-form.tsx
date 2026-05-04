"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { getPermissionDisplay } from "@/features/families/permission-labels";
import { MemberPermissionsDto } from "@/features/families/types";
import { t } from "@/lib/i18n";

type MemberPermissionsFormProps = {
  initialValues: MemberPermissionsDto;
  isSubmitting?: boolean;
  onSubmit?: (values: MemberPermissionsDto) => Promise<void>;
  onCancel?: () => void;
  readOnly?: boolean;
};

export function MemberPermissionsForm({
  initialValues,
  isSubmitting,
  onSubmit,
  onCancel,
  readOnly = false,
}: MemberPermissionsFormProps) {
  const form = useForm<MemberPermissionsDto>({
    defaultValues: initialValues,
  });
  const permissionKeys = Object.keys(initialValues)
    .filter((key) => typeof initialValues[key] === "boolean")
    .sort((left, right) => {
      const leftLabel = getPermissionDisplay(left).label;
      const rightLabel = getPermissionDisplay(right).label;
      return leftLabel.localeCompare(rightLabel, "pt-BR");
    });

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  return (
    <form
      className="space-y-4"
      onSubmit={
        onSubmit
          ? form.handleSubmit(async (values) => {
              await onSubmit(values);
            })
          : undefined
      }
    >
      <div className="space-y-3">
        {permissionKeys.map((permissionKey) => {
          const { label, description } = getPermissionDisplay(permissionKey);

          return (
            <label
              key={permissionKey}
              className="flex items-start gap-3 rounded-lg border border-border/70 bg-background px-3 py-2"
            >
              <input
                type="checkbox"
                className="mt-1 size-4 rounded border-input"
                {...form.register(permissionKey)}
                disabled={readOnly || isSubmitting}
              />
              <span>
                <span className="block text-sm font-medium text-foreground">
                  {label}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {description}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {!readOnly && onSubmit ? (
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t("family.permissions.submitting")
              : t("family.permissions.submit")}
          </Button>
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              {t("actions.cancel")}
            </Button>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
