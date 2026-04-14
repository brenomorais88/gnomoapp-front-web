import { enMessages } from "@/messages/en";
import { ptBRMessages } from "@/messages/pt-BR";

type Locale = "pt-BR" | "en";

type Messages = typeof ptBRMessages;

const messageCatalog: Record<Locale, Messages> = {
  "pt-BR": ptBRMessages,
  en: enMessages as unknown as Messages,
};

const defaultLocale: Locale = "pt-BR";

function getNestedValue(source: unknown, path: string) {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }

    return undefined;
  }, source);
}

export function getMessages(locale: Locale = defaultLocale) {
  return messageCatalog[locale];
}

export function t(
  key: string,
  options?: { locale?: Locale; values?: Record<string, string | number> },
) {
  const locale = options?.locale ?? defaultLocale;
  const baseValue = getNestedValue(getMessages(locale), key);

  if (typeof baseValue !== "string") {
    return key;
  }

  if (!options?.values) {
    return baseValue;
  }

  return Object.entries(options.values).reduce((result, [token, value]) => {
    return result.replaceAll(`{${token}}`, String(value));
  }, baseValue);
}
