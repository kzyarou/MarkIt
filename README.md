# MarkIt

Direct marketplace connecting farmers and fisherfolk with buyers. The current MVP lets producers post harvests and buyers browse listings, with role-based access, Firebase auth, and PWA/mobile builds. A price‑guarantee and bidding flow is planned and partially scaffolded but not yet fully live.

## 🌾 What’s in this app today

- **Auth and roles**: Email/password auth with roles `farmer`, `fisherman`, `buyer`, and `admin` (see `src/contexts/AuthContext.tsx`).
- **Harvest CRUD**:
  - Create harvests with details: category, quantity, grade/freshness, certifications, base price, dates, location, delivery options (see `src/pages/CreateHarvest.tsx`).
  - Edit or delete existing harvests (see `src/pages/EditHarvest.tsx`).
  - Data is stored in Firestore in a `harvests` collection.
- **Marketplace browsing**: Buyers can filter and view harvest listings (see `src/pages/MarketplacePage.tsx` and dashboard routes in `src/App.tsx`).
- **Role protection**: Routes gated by allowed roles via `RoleProtectedRoute`.
- **PWA + updates**: Service worker registration with update banners/notifications (`src/components/UpdateNotification.tsx`, `src/services/updateService.ts`).
- **Mobile builds**: Capacitor Android/iOS projects included. CodePush hooks exist for OTA updates.

## 🧭 What’s planned or partial

- **Bidding and price guarantee**: UI hooks and navigation exist (e.g., “Place Bid” buttons), but the full bid placement, acceptance, and settlement flow is not finished.
- **Transactions and payments**: Data types exist; no payment gateway is integrated yet.
- **Internationalization**: `LanguageContext` exists; full i18n and multi‑currency display are not complete.

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

## ⚠️ Known limitations (MVP)
- Bidding/price‑guarantee flow is not fully implemented.
- No payment gateway yet; transaction types are present but non‑functional.
- Some labels/configs may still use earlier cache naming.

## 🤝 Contributing
PRs welcome. Please open an issue describing the change before large contributions.

## 📄 License
MIT (see `LICENSE` if present).

—

MarkIt helps producers reach buyers directly with clear, fair listings. 🌾🐟