import { resolveLocaleFromLangId, getLangIdFromLocale, type SupportedLocale } from "~/helpers/languages";

export default defineNuxtPlugin(async (nuxtApp) => {
  const router = useRouter();
  const i18n = nuxtApp.$i18n as { locale: { value: string }; setLocale: (loc: string) => Promise<void> } | undefined;
  const langIdCookie = useCookie<string | number | null>("lang_id");

  const syncLanguageFromQueryOrCookie = async (queryLangId?: any) => {
    if (!i18n) return;

    // 1. Check URL query param (e.g. ?langId=1 or ?langId=2 or ?langId=3)
    const currentQuery = router.currentRoute.value?.query || {};
    let targetQueryVal = queryLangId || currentQuery.langId || currentQuery.lang_id || currentQuery.lang;

    // Fallback directly to window.location.search if route.query is not ready yet on app start
    if (!targetQueryVal && typeof window !== "undefined" && window.location?.search) {
      const searchParams = new URLSearchParams(window.location.search);
      targetQueryVal = searchParams.get("langId") || searchParams.get("lang_id") || searchParams.get("lang");
    }

    let targetLocale: SupportedLocale = "en";

    if (targetQueryVal) {
      targetLocale = resolveLocaleFromLangId(targetQueryVal);
    } else if (langIdCookie.value) {
      targetLocale = resolveLocaleFromLangId(langIdCookie.value);
    }

    const numericLangId = getLangIdFromLocale(targetLocale);
    langIdCookie.value = numericLangId;

    if (i18n.locale.value !== targetLocale) {
      await i18n.setLocale(targetLocale);
    }
  };

  // Run initial sync as early as possible
  await syncLanguageFromQueryOrCookie();

  // Watch route query parameter changes for instant reactivity
  watch(
    () => {
      const q = router.currentRoute.value?.query;
      return q?.langId || q?.lang_id || q?.lang;
    },
    (newLangId) => {
      if (newLangId) {
        syncLanguageFromQueryOrCookie(newLangId);
      }
    },
    { immediate: true }
  );

  // Watch route changes to detect langId if user navigates or URL updates
  router.afterEach((to) => {
    const qLangId = to.query.langId || to.query.lang_id || to.query.lang;
    if (qLangId) {
      syncLanguageFromQueryOrCookie(qLangId);
    }
  });
});
