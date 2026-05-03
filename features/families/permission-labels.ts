import { t } from "@/lib/i18n";

const knownPermissionKeyMap: Record<string, { labelKey: string; descriptionKey: string }> = {
  canViewFamilyAccounts: {
    labelKey: "family.permissions.fields.canViewFamilyAccounts.label",
    descriptionKey: "family.permissions.fields.canViewFamilyAccounts.description",
  },
  canCreateFamilyAccounts: {
    labelKey: "family.permissions.fields.canCreateFamilyAccounts.label",
    descriptionKey: "family.permissions.fields.canCreateFamilyAccounts.description",
  },
  canEditFamilyAccounts: {
    labelKey: "family.permissions.fields.canEditFamilyAccounts.label",
    descriptionKey: "family.permissions.fields.canEditFamilyAccounts.description",
  },
  canDeleteFamilyAccounts: {
    labelKey: "family.permissions.fields.canDeleteFamilyAccounts.label",
    descriptionKey: "family.permissions.fields.canDeleteFamilyAccounts.description",
  },
  canMarkFamilyAccountsPaid: {
    labelKey: "family.permissions.fields.canMarkFamilyAccountsPaid.label",
    descriptionKey: "family.permissions.fields.canMarkFamilyAccountsPaid.description",
  },
  canManageCategories: {
    labelKey: "family.permissions.fields.canManageCategories.label",
    descriptionKey: "family.permissions.fields.canManageCategories.description",
  },
  canInviteMembers: {
    labelKey: "family.permissions.fields.canInviteMembers.label",
    descriptionKey: "family.permissions.fields.canInviteMembers.description",
  },
  canManageMembers: {
    labelKey: "family.permissions.fields.canManageMembers.label",
    descriptionKey: "family.permissions.fields.canManageMembers.description",
  },
  canViewOtherPersonalAccounts: {
    labelKey: "family.permissions.fields.canViewOtherPersonalAccounts.label",
    descriptionKey: "family.permissions.fields.canViewOtherPersonalAccounts.description",
  },
  canEditOtherPersonalAccounts: {
    labelKey: "family.permissions.fields.canEditOtherPersonalAccounts.label",
    descriptionKey: "family.permissions.fields.canEditOtherPersonalAccounts.description",
  },
};

const fallbackTokenMap: Record<string, string> = {
  view: "Ver",
  create: "Criar",
  edit: "Editar",
  delete: "Excluir",
  mark: "Marcar",
  paid: "pagas",
  manage: "Gerenciar",
  categories: "categorias",
  invite: "convidar",
  members: "membros",
  family: "família",
  accounts: "contas",
  other: "de outros",
  personal: "pessoais",
  account: "conta",
};

function toReadableWords(permissionKey: string) {
  const withoutPrefix = permissionKey.replace(/^can/, "");
  if (!withoutPrefix) {
    return permissionKey;
  }

  const words = withoutPrefix
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .filter(Boolean)
    .map((token) => token.toLowerCase());

  const translated = words.map((token) => fallbackTokenMap[token] ?? token);
  const sentence = translated.join(" ").trim();
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

export function getPermissionDisplay(permissionKey: string) {
  const known = knownPermissionKeyMap[permissionKey];
  if (known) {
    return {
      label: t(known.labelKey),
      description: t(known.descriptionKey),
    };
  }

  return {
    label: toReadableWords(permissionKey),
    description: t("family.permissions.dynamicFallbackDescription"),
  };
}
