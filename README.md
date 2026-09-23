# VET EV Charger - Customer App

A mobile-responsive customer application for the VET EV Charger system, built with Nuxt.js, Vue.js, and Ionic.

---

## 🛠️ Tech Stack

- **Framework:** Nuxt 4 (SSR disabled)
- **UI & Mobile Framework:** Ionic Vue (`@nuxtjs/ionic`)
- **Native Mobile:** Capacitor (Android APK)
- **Build Tool:** Vite (via Nuxt)
- **Programming Language:** TypeScript
- **Internationalization (i18n):** `@nuxtjs/i18n` (See [TRANSLATION.md](file:///d:/UDAYA/github/PR_VET_Car_Rental_ReactJS/apps/vet-car-rental/TRANSLATION.md))

---

## 🚀 Folder Structure

Following production-grade Nuxt 4 structures, the `app/` folder is organized as follows:

```text
app/
├── apis/                             # API Repository Layer
│   ├── evCharger.repository.ts       # EV Charger endpoints
│   ├── terms.repository.ts           # Terms and conditions endpoints
│   ├── user.repository.ts            # User profile endpoints
│   ├── apiHelpers.ts                 # API helpers
│   ├── HttpFactory.ts                # HTTP factory
│   ├── queryKeys.ts                  # Vue query keys
│   └── index.ts                      # Centralized API exports
├── assets/                           # Static Assets & Styling
│   ├── css/                          # Global styles, component styles
│   └── theme/                        # Theme variables, typography, colors
├── components/                       # Vue / Ionic UI Components
│   ├── Button/                       # Custom buttons
│   ├── Card/                         # Card components
│   ├── Controls/                     # Input controls, checkboxes, selects
│   ├── Icon/                         # SVG Icons
│   ├── loading/                      # Skeleton loaders, loading states
│   └── Map/                          # Map integration components
├── composables/                      # Custom Vue Composables
│   ├── queries/                      # Vue Query hooks for data fetching
│   ├── useApiUrl.ts                  # API URL helper
│   ├── useAssetResolver.ts           # Asset resolving helper
│   ├── useAuthToken.ts               # Auth token management composable
│   ├── useNativeBridge.ts            # Native bridge for mobile apps
│   └── useUserProfile.ts             # User profile state management
├── data/                             # Mock data or static JSON data
├── helpers/                          # Application Helpers
│   └── languages/                    # i18n JSON sources (en-US, km-KH, zh-CN)
├── middleware/                       # Nuxt Navigation Guards
│   └── auth.global.ts                # Global authentication route guard
├── pages/                            # File-Based Routing Pages
│   ├── index.vue                     # Home / entry point page
│   ├── terms.vue                     # Terms and conditions page
│   ├── unauthorized.vue              # Unauthorized fallback page
│   ├── charging/                     # Charging related pages
│   └── ev_charger/                   # EV Charger locations and details
├── plugins/                          # Nuxt Client Plugins
│   ├── 00.ionic-nav.client.ts        # Ionic client navigation lifecycle
│   ├── axios.client.ts               # Axios interceptors and configuration
│   ├── i18n-detector.client.ts       # Auto-detects language from URL query & cookies
│   ├── vue-query.client.ts           # Vue Query plugin setup
│   └── zz.flutter-title.client.ts    # Native app title integration
├── services/                         # Business Logic & Validation Services
├── types/                            # TypeScript Type Definitions
├── utils/                            # Utility & Helper Functions
├── app.config.ts                     # Application configuration
├── app.vue                           # Root Vue application layout
└── error.vue                         # Custom error fallback page
```

---

## 💻 Development & Build Commands

### Setup
Install dependencies:
```bash
pnpm install
```

### Run Locally (Development)
Start the local development server on `http://localhost:3001`:
```bash
pnpm dev
```

---

## 📦 Production & Packaging

### 1. Build for Production
Compiles the application assets:
```bash
pnpm build
```

### 2. Package for Nginx (Static Hosting ZIP)
Generates a ZIP archive under `release/` containing the compiled static resources configured with the base URL path `/vet-ev-charger/`.
```bash
pnpm zip
```

### 3. Package for Tomcat (WAR)
Performs a Maven build to package the application as a Tomcat WAR archive under `release/`. The base URL environment variable is set automatically to ensure correct asset pathing in Tomcat.
```bash
pnpm war
# OR
mvn clean package
```

### 4. Locally Preview Production Build
Previews the generated static build locally:
```bash
pnpm preview
```

### 5. Build Android APK (via Capacitor)
Generates a native Android debug APK using Capacitor.

**Prerequisites:**
- Android SDK installed (`ANDROID_HOME` set)
- Java JDK 17+ (`JAVA_HOME` set)

**Steps:**
```bash
# 1. Generate static site with root base URL
NUXT_APP_BASE_URL=/ pnpm run generate

# 2. Add Android platform (first time only)
npx cap add android

# 3. Sync web assets to native project (after code changes)
npx cap sync

# 4. Build the debug APK
cd android && ./gradlew assembleDebug
```

The APK will be located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

**Quick rebuild after code changes:**
```bash
pnpm run build:mobile
cd android && ./gradlew assembleDebug
```
