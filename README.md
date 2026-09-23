# VET Car Rental - Customer App

A mobile-responsive customer application for the VET Car Rental system, built with Nuxt.js, Vue.js, and Ionic.

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

```
apps/vet-car-rental/app/
├── apis/                             # API Repository Layer
│   ├── booking.repository.ts         # Booking creation & status endpoints
│   ├── dropDown.repository.ts        # Dropdown options (locations, nationalities)
│   ├── user.repository.ts            # User profile endpoints
│   ├── vehicleRental.repository.ts   # Vehicle search, filters & detail endpoints
│   └── index.ts                      # Centralized API exports
├── assets/                           # Static Assets & Styling
│   └── css/main.css                  # Global styles, Ionic overrides & utility classes
├── components/                       # Vue / Ionic UI Components
│   ├── vehicle-rental/               # Vehicle cards, rental types, list pages
│   ├── map/                          # Google Maps integration & location markers
│   ├── modal/                        # Reusable Ionic modal dialogs
│   └── Button/ & Controls/           # Custom buttons, input controls, select pickers
├── helpers/                          # Application Helpers
│   └── languages/                    # i18n JSON sources (en-US, km-KH, zh-CN) & maps
├── composables/                      # Custom Vue Composables
│   ├── useAppLanguage.ts             # i18n & numeric langId (1=KM, 2=EN, 3=ZH) helper
│   ├── useNativeBridge.ts            # Flutter native bridge & webview channel
│   ├── useBookingState.ts            # Global rental booking state management
│   ├── useDropdown.ts                # Location & nationality cached data fetcher
│   └── useAuthToken.ts               # Auth token management composable
├── middleware/                       # Nuxt Navigation Guards
│   └── auth.global.ts                # Global authentication route guard
├── pages/                            # File-Based Routing Pages
│   ├── index.vue                     # Home / entry point page
│   └── vehicle-rental/               # Vehicle rental checkout workflow:
│       ├── index.vue                 # Vehicle search & filter listing
│       ├── schedule/                 # Rental dates & schedule selector
│       ├── tripInformation/          # Pickup/dropoff locations & traveler details
│       ├── bookDetail/               # Vehicle specs, facilities & reviews
│       ├── customerDetails/          # Customer info form & rental summary
│       └── paymentGateway/           # Payment gateway checkout & confirmation
├── plugins/                          # Nuxt Client Plugins
│   ├── i18n-detector.client.ts       # Auto-detects language from URL query & cookies
│   ├── flutter-title.client.ts       # Sends page title updates to Flutter app bar
│   └── 00.ionic-nav.client.ts        # Ionic client navigation lifecycle
├── services/                         # Business Logic & Validation Services
│   ├── booking.service.ts            # Booking calculations & state transitions
│   ├── schedule.service.ts           # Date validation & schedule logic
│   ├── trip.service.ts               # Location search & trip validation
│   ├── vehicle.service.ts            # Vehicle filtering & transformations
│   └── validation.service.ts         # Customer form validation rules
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
Generates a ZIP archive under `release/` containing the compiled static resources configured with the base URL path `/vet-car-rental/`.
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
