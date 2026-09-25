import * as Sentry from '@sentry/vue';

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();

  Sentry.init({
    app: nuxtApp.vueApp,
    dsn: "https://4ceac4037d86a84c495103c0df166178@o4512144714956800.ingest.us.sentry.io/4512144721707008", // Replace with your project DSN
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0, 
    replaysSessionSampleRate: 0.1, 
    replaysOnErrorSampleRate: 1.0, 
  });
});
