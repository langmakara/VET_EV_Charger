export default defineEventHandler((event) => {
  // 1. Check URL Query Parameter (e.g. ?langId=1 or ?langId=2 or ?langId=3)
  const query = getQuery(event);
  let langId = query.langId || query.lang_id || query.lang;

  // 2. If no query param, check incoming HTTP headers sent by Flutter/Native Mobile app
  if (!langId) {
    langId =
      getRequestHeader(event, "x-lang-id") ||
      getRequestHeader(event, "lang-id") ||
      getRequestHeader(event, "langid") ||
      getRequestHeader(event, "x-language-id");
  }

  // 3. Default to English (langId = 2) if no language parameter was provided
  if (!langId) {
    langId = 2;
  }

  if (langId) {
    const targetLocale = resolveServerLocaleFromLangId(langId as string | number);
    const numericLangId = getServerLangIdFromLocale(targetLocale);

    // Save in cookies so client-side Nuxt i18n picks it up immediately
    setCookie(event, "i18n_redirected", targetLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      sameSite: "lax",
    });

    setCookie(event, "lang_id", String(numericLangId), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      sameSite: "lax",
    });
  }
});
