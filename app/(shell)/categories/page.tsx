"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DataTable } from "@/components/shared/data/data-table";
import { SectionCard } from "@/components/shared/data/section-card";
import { StatusBadge } from "@/components/shared/data/status-badge";
import { Toolbar } from "@/components/shared/data/toolbar";
import { EmptyState } from "@/components/shared/feedback/empty-state";
import { ErrorState } from "@/components/shared/feedback/error-state";
import { LoadingState } from "@/components/shared/feedback/loading-state";
import { AppPageContainer } from "@/components/shared/layout/app-page-container";
import { PageHeader } from "@/components/shared/layout/page-header";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "@/features/categories/components/category-form";
import {
  useCategoriesListQuery,
  useCategoryDetailQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "@/features/categories/hooks";
import { CategoryFormValues } from "@/features/categories/schema";
import { CategoryDto } from "@/features/categories/types";
import { ApiError, getErrorMessage } from "@/lib/api/error";
import { t } from "@/lib/i18n";

const DEFAULT_COLOR = "#2563EB";

type Feedback = {
  tone: "success" | "danger";
  message: string;
};

function normalizeFormValues(values: CategoryFormValues) {
  return {
    name: values.name.trim(),
    description: values.description?.trim() || undefined,
    color: values.color?.trim() || undefined,
    active: values.active,
  };
}

function getDeleteErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 409) {
    return t("categories.deleteBlocked");
  }

  return getErrorMessage(error, t("categories.loadErrorTitle"));
}

function FeedbackBanner({ feedback }: { feedback: Feedback }) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm ${
        feedback.tone === "success"
          ? "border-success/30 bg-success/10 text-success"
          : "border-destructive/30 bg-destructive/10 text-destructive"
      }`}
    >
      {feedback.message}
    </div>
  );
}

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const categoriesQuery = useCategoriesListQuery();
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();

  const editingCategoryQuery = useCategoryDetailQuery(editingCategoryId ?? "");

  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    if (!normalizedSearch) {
      return categories;
    }

    return categories.filter((category) => {
      return (
        category.name.toLowerCase().includes(normalizedSearch) ||
        category.description?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [categories, search]);

  async function handleCreate(values: CategoryFormValues) {
    try {
      await createMutation.mutateAsync(normalizeFormValues(values));
      setFeedback({ tone: "success", message: t("categories.createSuccess") });
      setIsCreateOpen(false);
    } catch (error) {
      setFeedback({
        tone: "danger",
        message: getErrorMessage(error, t("categories.loadErrorTitle")),
      });
    }
  }

  async function handleEdit(values: CategoryFormValues) {
    if (!editingCategoryId) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editingCategoryId,
        payload: normalizeFormValues(values),
      });
      setFeedback({ tone: "success", message: t("categories.updateSuccess") });
      setEditingCategoryId(null);
    } catch (error) {
      setFeedback({
        tone: "danger",
        message: getErrorMessage(error, t("categories.loadDetailErrorTitle")),
      });
    }
  }

  async function handleDelete(category: CategoryDto) {
    const confirmed = window.confirm(
      t("categories.deleteConfirm", { values: { name: category.name } }),
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(category.id);
      setFeedback({ tone: "success", message: t("categories.deleteSuccess") });
    } catch (error) {
      setFeedback({
        tone: "danger",
        message: getDeleteErrorMessage(error),
      });
    }
  }

  return (
    <AppPageContainer className="ds-section-gap">
      <PageHeader title={t("categories.title")} description={t("categories.description")} />

      {feedback ? <FeedbackBanner feedback={feedback} /> : null}

      <Toolbar
        left={
          <input
            className="ds-focus-ring h-9 min-w-[220px] rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
            placeholder={t("categories.searchPlaceholder")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        }
        right={
          <Button
            onClick={() => {
              setIsCreateOpen(true);
              setEditingCategoryId(null);
              setFeedback(null);
            }}
          >
            <Plus className="size-4" />
            {t("actions.newCategory")}
          </Button>
        }
      />

      {isCreateOpen ? (
        <SectionCard title={t("categories.createTitle")} description={t("categories.createDescription")}>
          <CategoryForm
            mode="create"
            isSubmitting={createMutation.isPending}
            onCancel={() => setIsCreateOpen(false)}
            onSubmit={handleCreate}
          />
        </SectionCard>
      ) : null}

      {editingCategoryId ? (
        <SectionCard title={t("categories.editTitle")} description={t("categories.editDescription")}>
          {editingCategoryQuery.isLoading ? (
            <LoadingState label={t("categories.loadingDetail")} />
          ) : editingCategoryQuery.isError ? (
            <ErrorState
              title={t("categories.loadDetailErrorTitle")}
              description={getErrorMessage(editingCategoryQuery.error)}
              action={
                <Button variant="outline" onClick={() => setEditingCategoryId(null)}>
                  {t("actions.close")}
                </Button>
              }
            />
          ) : (
            <CategoryForm
              mode="edit"
              isSubmitting={updateMutation.isPending}
              initialValues={{
                name: editingCategoryQuery.data?.name ?? "",
                description: editingCategoryQuery.data?.description ?? "",
                color: editingCategoryQuery.data?.color ?? DEFAULT_COLOR,
                active: editingCategoryQuery.data?.active ?? true,
              }}
              onCancel={() => setEditingCategoryId(null)}
              onSubmit={handleEdit}
            />
          )}
        </SectionCard>
      ) : null}

      <SectionCard title={t("categories.listTitle")} description={t("categories.listDescription")}>
        {categoriesQuery.isLoading ? (
          <LoadingState label={t("categories.loadingList")} />
        ) : categoriesQuery.isError ? (
          <ErrorState
            title={t("categories.loadErrorTitle")}
            description={getErrorMessage(categoriesQuery.error)}
            action={
              <Button variant="outline" onClick={() => categoriesQuery.refetch()}>
                {t("actions.tryAgain")}
              </Button>
            }
          />
        ) : filteredCategories.length === 0 ? (
          <EmptyState
            title={categories.length === 0 ? t("categories.noCategories") : t("states.noResults")}
            description={
              categories.length === 0
                ? t("categories.noCategoriesDescription")
                : t("categories.noResultsDescription")
            }
            action={
              categories.length === 0 ? (
                <Button onClick={() => setIsCreateOpen(true)}>{t("actions.createCategory")}</Button>
              ) : undefined
            }
          />
        ) : (
          <DataTable>
            <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">{t("categories.table.name")}</th>
                <th className="px-4 py-3 font-medium">{t("categories.table.description")}</th>
                <th className="px-4 py-3 font-medium">{t("categories.table.color")}</th>
                <th className="px-4 py-3 font-medium">{t("categories.table.status")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("categories.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id} className="border-t border-border/70">
                  <td className="px-4 py-3 font-medium text-foreground">{category.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {category.description || t("common.notAvailable")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-3 rounded-full border border-border"
                        style={{ backgroundColor: category.color || DEFAULT_COLOR }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {category.color || DEFAULT_COLOR}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={category.active === false ? t("categories.inactive") : t("categories.active")}
                      tone={category.active === false ? "neutral" : "success"}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCategoryId(category.id);
                          setIsCreateOpen(false);
                          setFeedback(null);
                        }}
                      >
                        <Pencil className="size-3.5" />
                        {t("actions.edit")}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(category)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="size-3.5" />
                        {t("actions.delete")}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </SectionCard>
    </AppPageContainer>
  );
}
