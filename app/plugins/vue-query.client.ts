/**
 * TanStack Vue Query plugin.
 *
 * The app runs with `ssr: false` (Ionic/Capacitor mobile mini-app), so there
 * is no dehydrate/hydrate story to wire up here — just a single client-side
 * QueryClient shared by every `useQuery`/`useMutation` call in
 * `~/composables/queries/*`.
 */
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";

export default defineNuxtPlugin((nuxtApp) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 min — avoid refetch storms when hopping between pages
        gcTime: 5 * 60 * 1000,
        retry: 1,
        // Mobile WebView fires focus events on app resume more aggressively
        // than a desktop tab; default that off and let screens opt in.
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });

  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient });

  return {
    provide: {
      queryClient,
    },
  };
});
