"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, type ChangeEvent } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useCategoriesListQuery } from "@/features/categories/hooks";
import { accountFormSchema, AccountFormValues, recurrenceTypeOptions } from "@/features/accounts/schema";
import { computeEndDateFromInstallments } from "@/features/accounts/lib/compute-end-date";
import { LoadingState } from "@/components/shared/feedback/loading-state";
import { ErrorState } from "@/components/shared/feedback/error-state";
import { useMyFamilyMembersQuery } from "@/features/families/hooks";
import { getErrorMessage } from "@/lib/api/error";
import {
  centsToApiDecimalString,
  decimalApiStringToCents,
  formatCentsAsBrlDisplay,
  parseMoneyInputToCents,
} from "@/lib/format/brl-money-input";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

type AccountFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<AccountFormValues>;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: AccountFormValues) => Promise<void>;
};

const inputClassName =
  "ds-focus-ring w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground";

export function AccountForm({
  mode,
  initialValues,
  isSubmitting,
  onCancel,
  onSubmit,
}: AccountFormProps) {
  const categoriesQuery = useCategoriesListQuery({ active: true });
  const familyMembersQuery = useMyFamilyMembersQuery();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      baseAmount: initialValues?.baseAmount ?? "0.00",
      startDate: initialValues?.startDate ?? "",
      endDate: initialValues?.endDate ?? "",
      recurrenceType: initialValues?.recurrenceType ?? "MONTHLY",
      categoryId: initialValues?.categoryId ?? "",
      ownershipType: initialValues?.ownershipType ?? "PERSONAL",
      responsibleMemberId: initialValues?.responsibleMemberId ?? "",
      notes: initialValues?.notes ?? "",
      active: initialValues?.active ?? true,
      installmentCount: "",
    },
  });
  const ownershipType = useWatch({
    control: form.control,
    name: "ownershipType",
  });
  const startDate = useWatch({ control: form.control, name: "startDate" });
  const recurrenceType = useWatch({ control: form.control, name: "recurrenceType" });
  const installmentCount = useWatch({ control: form.control, name: "installmentCount" });
  const { setValue } = form;

  const initialValuesSnapshot = useMemo(
    () => JSON.stringify(initialValues ?? null),
    [initialValues],
  );

  useEffect(() => {
    let parsed: Partial<AccountFormValues> | undefined;
    try {
      parsed = initialValuesSnapshot === "null" ? undefined : JSON.parse(initialValuesSnapshot);
    } catch {
      parsed = undefined;
    }

    form.reset({
      title: parsed?.title ?? "",
      baseAmount: parsed?.baseAmount ?? "0.00",
      startDate: parsed?.startDate ?? "",
      endDate: parsed?.endDate ?? "",
      recurrenceType: parsed?.recurrenceType ?? "MONTHLY",
      categoryId: parsed?.categoryId ?? "",
      ownershipType: parsed?.ownershipType ?? "PERSONAL",
      responsibleMemberId: parsed?.responsibleMemberId ?? "",
      notes: parsed?.notes ?? "",
      active: parsed?.active ?? true,
      installmentCount: "",
    });
  }, [form, initialValuesSnapshot]);

  useEffect(() => {
    if (!startDate) {
      setValue("installmentCount", "", { shouldValidate: true });
    }
  }, [startDate, setValue]);

  useEffect(() => {
    const raw = installmentCount?.trim() ?? "";
    const n = Number.parseInt(raw, 10);
    if (!startDate || raw === "" || Number.isNaN(n) || n < 1) {
      return;
    }
    const end = computeEndDateFromInstallments(startDate, recurrenceType, n);
    if (end) {
      setValue("endDate", end, { shouldDirty: true, shouldValidate: true });
    }
  }, [startDate, recurrenceType, installmentCount, setValue]);

  if (categoriesQuery.isLoading || familyMembersQuery.isLoading) {
    return <LoadingState label={t("accounts.form.loadingOptions")} className="min-h-24" />;
  }

  if (categoriesQuery.isError || familyMembersQuery.isError) {
    return (
      <ErrorState
        title={t("accounts.form.loadDependenciesErrorTitle")}
        description={getErrorMessage(categoriesQuery.error) || getErrorMessage(familyMembersQuery.error)}
        action={
          <Button
            variant="outline"
            onClick={() => {
              categoriesQuery.refetch();
              familyMembersQuery.refetch();
            }}
          >
            {t("actions.tryAgain")}
          </Button>
        }
      />
    );
  }

  const categoryOptions = categoriesQuery.data ?? [];
  const memberOptions = (familyMembersQuery.data ?? []).filter(
    (member) => member.status === "ACTIVE" || member.status === "PENDING_REGISTRATION",
  );

  return (
    <form
      className="grid gap-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2 sm:col-span-2">
          <label htmlFor="account-title" className="text-sm font-medium text-foreground">
            {t("accounts.form.title")}
          </label>
          <input id="account-title" className={inputClassName} {...form.register("title")} />
          {form.formState.errors.title ? (
            <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label htmlFor="account-baseAmount" className="text-sm font-medium text-foreground">
            {t("accounts.form.baseAmount")}
          </label>
          <Controller
            name="baseAmount"
            control={form.control}
            render={({ field }) => {
              const cents = decimalApiStringToCents(field.value || "0");
              return (
                <input
                  id="account-baseAmount"
                  className={inputClassName}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder={formatCentsAsBrlDisplay(0)}
                  value={formatCentsAsBrlDisplay(cents)}
                  onChange={(e) => {
                    const nextCents = parseMoneyInputToCents(e.target.value);
                    field.onChange(centsToApiDecimalString(nextCents));
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              );
            }}
          />
          {form.formState.errors.baseAmount ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.baseAmount.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label htmlFor="account-recurrenceType" className="text-sm font-medium text-foreground">
            {t("accounts.form.recurrenceType")}
          </label>
          <select
            id="account-recurrenceType"
            className={cn(inputClassName, "h-10")}
            {...form.register("recurrenceType")}
          >
            {recurrenceTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label htmlFor="account-startDate" className="text-sm font-medium text-foreground">
            {t("accounts.form.startDate")}
          </label>
          <input
            id="account-startDate"
            type="date"
            className={cn(inputClassName, "h-10")}
            {...form.register("startDate")}
          />
          {form.formState.errors.startDate ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.startDate.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label htmlFor="account-installmentCount" className="text-sm font-medium text-foreground">
            {t("accounts.form.installmentCount")}
          </label>
          <input
            id="account-installmentCount"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={3}
            disabled={!startDate}
            placeholder="—"
            className={cn(inputClassName, "h-10", !startDate && "cursor-not-allowed opacity-60")}
            {...(() => {
              const { onChange, ...rest } = form.register("installmentCount");
              return {
                ...rest,
                onChange: (e: ChangeEvent<HTMLInputElement>) => {
                  const cleaned = e.target.value.replace(/\D/g, "").slice(0, 3);
                  e.target.value = cleaned;
                  onChange(e);
                },
              };
            })()}
          />
          {!startDate ? (
            <p className="text-xs text-muted-foreground">{t("accounts.form.installmentCountHint")}</p>
          ) : null}
          {form.formState.errors.installmentCount ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.installmentCount.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <label htmlFor="account-endDate" className="text-sm font-medium text-foreground">
            {t("accounts.form.endDate")}
          </label>
          <input
            id="account-endDate"
            type="date"
            className={cn(inputClassName, "h-10 max-w-full sm:max-w-xs")}
            {...form.register("endDate")}
          />
          {form.formState.errors.endDate ? (
            <p className="text-xs text-destructive">{form.formState.errors.endDate.message}</p>
          ) : null}
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <label htmlFor="account-ownershipType" className="text-sm font-medium text-foreground">
            {t("accounts.form.ownershipType")}
          </label>
          <select
            id="account-ownershipType"
            className={cn(inputClassName, "h-10")}
            {...form.register("ownershipType")}
          >
            <option value="PERSONAL">{t("accounts.ownershipType.PERSONAL")}</option>
            <option value="FAMILY">{t("accounts.ownershipType.FAMILY")}</option>
          </select>
        </div>

        {ownershipType === "FAMILY" ? (
          <div className="grid gap-2 sm:col-span-2">
            <label htmlFor="account-responsibleMemberId" className="text-sm font-medium text-foreground">
              {t("accounts.form.responsibleMember")}
            </label>
            <select
              id="account-responsibleMemberId"
              className={cn(inputClassName, "h-10")}
              {...form.register("responsibleMemberId")}
            >
              <option value="">{t("accounts.form.selectResponsibleMember")}</option>
              {memberOptions.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            {form.formState.errors.responsibleMemberId ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.responsibleMemberId.message}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-2 sm:col-span-2">
          <label htmlFor="account-categoryId" className="text-sm font-medium text-foreground">
            {t("accounts.form.category")}
          </label>
          <select
            id="account-categoryId"
            className={cn(inputClassName, "h-10")}
            {...form.register("categoryId")}
          >
            <option value="">{t("accounts.form.selectCategory")}</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {form.formState.errors.categoryId ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.categoryId.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <label htmlFor="account-notes" className="text-sm font-medium text-foreground">
            {t("accounts.form.notes")}
          </label>
          <textarea
            id="account-notes"
            className={cn(inputClassName, "min-h-24 resize-y")}
            {...form.register("notes")}
          />
          {form.formState.errors.notes ? (
            <p className="text-xs text-destructive">{form.formState.errors.notes.message}</p>
          ) : null}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" className="size-4 rounded border-input" {...form.register("active")} />
        {t("accounts.form.active")}
      </label>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {mode === "create" ? t("actions.createAccount") : t("actions.saveChanges")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {t("actions.cancel")}
        </Button>
      </div>
    </form>
  );
}
