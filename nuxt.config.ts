// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  css: ["~/assets/css/main.css"],
  modules: ["@nuxtjs/ionic", "@nuxtjs/i18n"],
  i18n: {
    lazy: true,
    langDir: "../app/helpers/languages/sources",
    defaultLocale: "en",
    strategy: "no_prefix",
    locales: [
      { code: "en", iso: "en-US", name: "English", file: "en-US.ts" },
      { code: "km", iso: "km-KH", name: "Khmer", file: "km-KH.ts" },
      { code: "zh", iso: "zh-CN", name: "Chinese", file: "zh-CN.ts" },
    ],
    bundle: {
      optimizeTranslationDirective: false,
    },
  },
  ionic: {
    config: {
      swipeBackEnabled: true,
    },
  },
  ssr: false,
  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ["google.maps"],
      },
    },
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === "capacitor-google-map",
    },
  },
  devServer: {
    port: 3001,
    host: "0.0.0.0",
  },
  nitro: {
    output: {
      publicDir: "dist",
    },
  },
  routeRules: {
    "/**": {
      cors: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept, Origin, X-Requested-With, x-lang-id, lang-id",
      },
    },
    "/api/**": {
      cors: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept, Origin, X-Requested-With, x-lang-id, lang-id",
      },
    },
  },
  vite: {
    optimizeDeps: {
      include: ["ionicons/icons", "@capacitor/geolocation"],
    },
    server: {
      strictPort: false,
      allowedHosts: true,
    },
  },
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || "/vet-ev-charger/",
    head: {
      title: "EV Charger",
      script: [
        {
          innerHTML:
            'window.setMobileToken=function(t){window.pendingMobileToken=t;try{localStorage.setItem("access_token",t);document.cookie="access_token="+encodeURIComponent(t)+";path=/;max-age=604800";}catch(e){}};(function(){function getTitle(){var l=null;try{if(window.location&&window.location.search){var p=new URLSearchParams(window.location.search);l=p.get("langId")||p.get("lang_id")||p.get("lang");}}catch(e){}if(!l){try{var m=document.cookie.match(/(?:^|;\\s*)lang_id=([^;]*)/);if(m)l=decodeURIComponent(m[1]);}catch(e){}}if(l==="1"||l==="km"||l==="km-KH")return"ស្ថានីយ៍សាក EV";if(l==="3"||l==="zh"||l==="zh-CN")return"充电站";return"EV Charger";}function sendTitle(){var e=getTitle();if(window.flutter_inappwebview&&window.flutter_inappwebview.callHandler){window.flutter_inappwebview.callHandler("SetAppBarTitle",e).catch(function(){});}else if(window.SetAppBarTitle&&window.SetAppBarTitle.postMessage){window.SetAppBarTitle.postMessage(e);}}sendTitle();window.addEventListener("flutterInAppWebViewPlatformReady",sendTitle);document.addEventListener("DOMContentLoaded",sendTitle);})();',
        },
      ],
    },
  },
  runtimeConfig: {
    // Private: ONLY available inside the server/ directory
    apiBaseUrl: "",
    public: {
      nodeEnv: process.env.VITE_NODE_ENV || "qa",
      appName: process.env.VITE_APP_NAME || "VET EV Charger",
      apiUrl: process.env.VITE_API_URL || "",
      apiUrlProd: process.env.VITE_API_URL_PROD || "https://qadockerde.udaya-tech.com:10",
      apiUrlQa: process.env.VITE_API_URL_QA || "https://qadockerde.udaya-tech.com:10",
      apiUrlLocal: process.env.VITE_API_URL_LOCAL || "http://192.168.10.10:8080",
      apiUrlDev: process.env.VITE_API_URL_DEV || "http://phea.local:11137",
      googleMapApiKey: process.env.VITE_GOOGLE_MAP_API_KEY || "",
    },
  },
  future: {
    compatibilityVersion: 4,
  },
});
