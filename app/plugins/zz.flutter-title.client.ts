import { sendTitleToFlutter } from "~/composables/useNativeBridge";
import type { RouteLocationNormalized } from "vue-router";

const DEFAULT_TITLE_KEY = "titles.vehicleRental";

/**
 * Maps route paths to i18n translation keys under the "titles" namespace.
 */
const ROUTE_TITLE_KEY_MAP: Record<string, string> = {
  "/": "titles.vehicleRental",
  "/vehicle-rental/tripInformation": "titles.tripInformation",
  "/vehicle-rental/schedule": "titles.schedule",
  "/vehicle-rental/bookDetail": "titles.vehicleDetail",
  "/vehicle-rental/customerDetails": "titles.customerDetails",
  "/vehicle-rental/payment": "titles.paymentType",
  "/vehicle-rental/paymentGateway": "titles.paymentGateway",
  "/unauthorized": "titles.unauthorized",
  "/terms": "titles.terms",
};

/**
 * Resolves the i18n translation key for a given route.
 */
const resolveTitleKey = (to: RouteLocationNormalized): string => {
  if (to.meta?.titleKey) {
    return String(to.meta.titleKey);
  }

  const directKey = ROUTE_TITLE_KEY_MAP[to.path];
  if (directKey) {
    return directKey;
  }

  const matchedPath = to.matched?.[0]?.path;
  if (matchedPath) {
    const matchedKey = ROUTE_TITLE_KEY_MAP[matchedPath];
    if (matchedKey) {
      return matchedKey;
    }
  }

  // Fallback so the native app bar never shows a stale title for an unmapped route
  return DEFAULT_TITLE_KEY;
};

export default defineNuxtPlugin(() => {
  const router = useRouter();
  const { $i18n } = useNuxtApp();
  const { t, locale } = $i18n;

  const sendTranslatedTitle = (to: RouteLocationNormalized) => {
    // bookDetail page manages its own dynamic vehicle name title
    if (to.path === "/vehicle-rental/bookDetail") {
      return;
    }
    // If the route has an explicit (already-translated) title via query, use it directly
    if (to.query?.title) {
      sendTitleToFlutter(String(to.query.title));
      return;
    }
    const key = resolveTitleKey(to);
    sendTitleToFlutter(t(key));
  };

  // 1. Send title immediately as early as possible without waiting for router.isReady()
  const initialRoute = router.currentRoute.value;
  if (initialRoute) {
    sendTranslatedTitle(initialRoute);
  } else {
    sendTitleToFlutter(t(DEFAULT_TITLE_KEY));
  }

  // 2. Once router is fully ready, ensure initial route title is accurately sent
  router.isReady().then(() => {
    sendTranslatedTitle(router.currentRoute.value);
  });

  // 3. Send title updates on route changes
  router.afterEach((to) => {
    sendTranslatedTitle(to);
  });

  // 4. Re-send title when locale changes so the native app bar updates language
  watch(locale, () => {
    sendTranslatedTitle(router.currentRoute.value);
  });
});
