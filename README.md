# MarkIt

Direct marketplace connecting farmers and fisherfolk with buyers. A modern PWA that lets producers post harvests and consumers browse listings with real-time pricing, messaging, and mobile-optimized experience.

## 🌾 What's in this app today

- **Auth and roles**: Email/password auth with roles `Producer`, `Consumer`, and `admin` (see `src/contexts/AuthContext.tsx`).
- **Harvest Management**:
  - Create harvests with details: category, quantity, grade/freshness, certifications, base price, dates, location, delivery options (see `src/pages/CreateHarvest.tsx`).
  - Edit or delete existing harvests (see `src/pages/EditHarvest.tsx`).
  - Data is stored in Firestore in a `harvests` collection.
- **Product Search & Discovery**: 
  - Advanced search functionality with real-time pricing analytics
  - Filter by price range and sort by lowest/highest prices
  - Mobile-optimized search interface
- **Real-time Messaging**: 
  - Direct communication between producers and consumers
  - Message persistence and real-time updates
  - Mobile-friendly chat interface
- **Role-based Dashboard**: 
  - Producer dashboard for managing harvests and viewing analytics
  - Consumer dashboard for browsing products and managing purchases
- **Mobile-First Design**: 
  - Responsive PWA with mobile navigation
  - Bottom navigation for easy mobile access
  - Touch-optimized interface
- **PWA + Updates**: Service worker registration with update banners (`src/components/UpdateNotification.tsx`, `src/services/updateService.ts`).
- **Mobile Builds**: Capacitor Android/iOS projects with signed APK generation.

## 🧭 What's planned or partial
- **Transactions and payments**: Data types exist; no payment gateway is integrated yet.
- **Internationalization**: `LanguageContext` exists; full i18n and multi‑currency display are not complete.
- **Price Guarantee**: UI components exist but full implementation is pending.

## 🛠️ Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS + Radix UI + shadcn components
- Firebase: Auth, Firestore, (Storage optional for media)
- React Router, Context API; Framer Motion; Lucide icons
- PWA via service worker; Capacitor for mobile; optional CodePush

## 🏗️ Project structure (high level)

```
src/
├── components/      # Reusable UI (includes update banners/notifications)
├── contexts/        # Auth, language, drafts
├── lib/             # Firebase config and utilities
├── pages/           # Auth, Dashboard, Marketplace, Create/Edit Harvest, etc.
├── services/        # Update service and app services
├── types/           # TypeScript models (Harvest, Transaction, etc.)
└── utils/           # Helpers
```

## 🚀 Getting started

### Prerequisites
- Node.js 18+
- Firebase project (Auth + Firestore enabled)

### Install and run
1) Install deps
```bash
npm install
```
2) Configure Firebase in `src/lib/firebase.ts` and add env vars (create `.env.local`):
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```
3) Start dev server
```bash
npm run dev
```
4) Build web (PWA)
```bash
npm run build:pwa
```

### Mobile (Capacitor)
- Sync web build into native projects:
```bash
npm run build:mobile
```
- Open platforms:
```bash
npm run open:android
npm run open:ios
```
- Android signed build (requires gradle setup):
```bash
npm run build:android:signed
```

## 🔄 Updates
- PWA auto‑updates via service worker; users may see an in‑app update prompt.
- Optional OTA (CodePush) scaffolding exists; add deployment keys in `capacitor.config.ts` if you enable it.

## 📱 Mobile App

The app is available as a signed APK for Android devices. The APK is generated using Capacitor and includes all the latest features:

- **Download**: `MarkIt-app-release.apk` (2.7MB)
- **Features**: Full PWA functionality with native mobile optimizations
- **Requirements**: Android 5.0+ (API level 21+)

## ⚠️ Known limitations (MVP)
- Price guarantee flow is not fully implemented.
- No payment gateway yet; transaction types are present but non‑functional.
- Some legacy role references may exist in older cached data.

## 🤝 Contributing
PRs welcome. Please open an issue describing the change before large contributions.

## 📄 License
MIT (see `LICENSE` if present).

—

MarkIt helps producers reach buyers directly with clear, fair listings. 🌾🐟