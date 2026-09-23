export type SupportedLocale = "en" | "km" | "zh";

export interface LanguageOption {
  id: number;
  code: SupportedLocale;
  iso: string;
  name: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { id: 1, code: "km", iso: "km-KH", name: "Khmer" },
  { id: 2, code: "en", iso: "en-US", name: "English" },
  { id: 3, code: "zh", iso: "zh-CN", name: "Chinese" },
];

export const LANG_ID_TO_CODE_MAP: Record<number | string, SupportedLocale> = {
  1: "km",
  2: "en",
  3: "zh",
  km: "km",
  en: "en",
  zh: "zh",
};

export const CODE_TO_LANG_ID_MAP: Record<string, number> = {
  km: 1,
  "km-KH": 1,
  en: 2,
  "en-US": 2,
  zh: 3,
  "zh-CN": 3,
};

/**
 * Resolve language code ('km', 'en', 'zh') from a numeric langId or string code.
 * Fallback to 'en' (English) if invalid or unrecognized.
 */
export const resolveLocaleFromLangId = (langId?: number | string | null): SupportedLocale => {
  if (!langId) return "en";
  const mapped = LANG_ID_TO_CODE_MAP[langId];
  return mapped || "en";
};

/**
 * Get numeric langId (1=Khmer, 2=English, 3=Chinese) from a locale code.
 */
export const getLangIdFromLocale = (localeCode?: string | null): number => {
  if (!localeCode) return 2;
  return CODE_TO_LANG_ID_MAP[localeCode] || 2;
};
