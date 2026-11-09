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
  kh: "km",
  "km-kh": "km",
  "kh-kh": "km",
  en: "en",
  "en-us": "en",
  zh: "zh",
  cn: "zh",
  "zh-cn": "zh",
  "zh-tw": "zh",
  "zh-hk": "zh",
};

export const CODE_TO_LANG_ID_MAP: Record<string, number> = {
  km: 1,
  kh: 1,
  "km-KH": 1,
  "kh-KH": 1,
  en: 2,
  "en-US": 2,
  zh: 3,
  cn: 3,
  "zh-CN": 3,
};

/**
 * Resolve language code ('km', 'en', 'zh') from a numeric langId or string code ('en', 'kh', 'zh', etc.).
 * Fallback to 'en' (English) if invalid or unrecognized.
 */
export const resolveLocaleFromLangId = (langId?: number | string | null): SupportedLocale => {
  if (!langId) return "en";
  const clean = typeof langId === "string" ? langId.trim().toLowerCase() : langId;
  const mapped = LANG_ID_TO_CODE_MAP[clean] || LANG_ID_TO_CODE_MAP[langId];
  if (mapped) return mapped;

  if (typeof clean === "string") {
    if (clean.startsWith("kh") || clean.startsWith("km")) return "km";
    if (clean.startsWith("zh") || clean.startsWith("cn")) return "zh";
    if (clean.startsWith("en")) return "en";
  }

  return "en";
};

/**
 * Get numeric langId (1=Khmer, 2=English, 3=Chinese) from a locale code.
 */
export const getLangIdFromLocale = (localeCode?: string | null): number => {
  if (!localeCode) return 2;
  const clean = typeof localeCode === "string" ? localeCode.trim().toLowerCase() : localeCode;
  return CODE_TO_LANG_ID_MAP[clean] || CODE_TO_LANG_ID_MAP[localeCode] || 2;
};

/**
 * Changes the active language across Nuxt i18n, cookies, and local storage.
 */
export const changeAppLanguage = async (
  rawLang: number | string | null | undefined,
  i18nInstance?: any
): Promise<SupportedLocale> => {
  const targetLocale = resolveLocaleFromLangId(rawLang);
  const numericLangId = getLangIdFromLocale(targetLocale);

  // 1. Sync cookie for API headers and native webview
  try {
    const langCookie = useCookie<string | number | null>("lang_id");
    langCookie.value = numericLangId;
  } catch (_) {}

  // 2. Sync localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("lang_id", String(numericLangId));
      localStorage.setItem("user_lang", targetLocale);
    } catch (_) {}
  }

  // 3. Switch i18n locale
  const i18n = i18nInstance || (typeof useNuxtApp === "function" ? (useNuxtApp().$i18n as any) : undefined);
  if (i18n) {
    try {
      if (typeof i18n.setLocale === "function") {
        if (i18n.locale?.value !== targetLocale) {
          await i18n.setLocale(targetLocale);
        }
      } else if (i18n.locale) {
        i18n.locale.value = targetLocale;
      }
    } catch (err) {
      console.warn("[changeAppLanguage] Failed to update i18n locale:", err);
    }
  }

  return targetLocale;
};
