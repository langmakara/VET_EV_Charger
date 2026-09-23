const LANG_ID_MAP: Record<string, string> = {
  "1": "km",
  "2": "en",
  "3": "zh",
  km: "km",
  en: "en",
  zh: "zh",
};

const CODE_TO_ID_MAP: Record<string, number> = {
  km: 1,
  "km-KH": 1,
  en: 2,
  "en-US": 2,
  zh: 3,
  "zh-CN": 3,
};

export const resolveServerLocaleFromLangId = (langId?: number | string | null): string => {
  if (!langId) return "en";
  return LANG_ID_MAP[langId] || "en";
};

export const getServerLangIdFromLocale = (localeCode?: string | null): number => {
  if (!localeCode) return 2;
  return CODE_TO_ID_MAP[localeCode] || 2;
};
