"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { categoryFormSchema, CategoryFormValues } from "@/features/categories/schema";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

type CategoryFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<CategoryFormValues>;
  isSubmitting?: boolean;
  isReadOnly?: boolean;
  onCancel: () => void;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
};

const inputClassName =
  "ds-focus-ring w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground";

export function CategoryForm({
  mode,
  initialValues,
  isSubmitting,
  isReadOnly,
  onCancel,
  onSubmit,
}: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      color: initialValues?.color ?? "#2563EB",
      active: initialValues?.active ?? true,
    },
  });
  const selectedColor = useWatch({
    control: form.control,
    name: "color",
  });

  useEffect(() => {
    form.reset({
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      color: initialValues?.color ?? "#2563EB",
      active: initialValues?.active ?? true,
    });
  }, [form, initialValues]);

  return (
    <form
      className="grid gap-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="category-name">
          {t("categories.form.name")}
        </label>
        <input
          id="category-name"
          className={inputClassName}
          disabled={isReadOnly}
          {...form.register("name")}
        />
        {form.formState.errors.name ? (
          <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="category-description"
        >
          {t("categories.form.description")}
        </label>
        <textarea
          id="category-description"
          className={cn(inputClassName, "min-h-20 resize-y")}
          disabled={isReadOnly}
          {...form.register("description")}
        />
        {form.formState.errors.description ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.description.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2 sm:max-w-xs">
        <label className="text-sm font-medium text-foreground" htmlFor="category-color">
          {t("categories.form.color")}
        </label>
        <div className="flex items-center gap-2">
          <input
            id="category-color"
            type="color"
            className="h-9 w-12 rounded-md border border-input bg-background p-1"
            value={selectedColor || "#2563EB"}
            disabled={isReadOnly}
            onChange={(event) => {
              form.setValue("color", event.target.value, { shouldValidate: true });
            }}
          />
          <input className={inputClassName} disabled={isReadOnly} {...form.register("color")} />
        </div>
        {form.formState.errors.color ? (
          <p className="text-xs text-destructive">{form.formState.errors.color.message}</p>
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          className="size-4 rounded border-input"
          disabled={isReadOnly}
          {...form.register("active")}
        />
        {t("categories.form.active")}
      </label>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button type="submit" disabled={isSubmitting || isReadOnly}>
          {mode === "create"
            ? t("actions.createCategory")
            : t("actions.saveChanges")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {t("actions.cancel")}
        </Button>
      </div>
    </form>
  );
}
