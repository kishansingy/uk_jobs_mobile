# UK Medical Jobs — Mobile App

Vue 3 + Capacitor candidate-facing mobile app for Android (iOS-ready).

## Stack
- Vue 3 (Composition API)
- Vite 5
- Pinia (state)
- Vue Router 4 (hash history for Capacitor)
- Tailwind CSS 3 (NHS colour palette)
- Capacitor 6 (Android/iOS wrapper)
- Stripe.js (payment)
- Axios (API)

## Getting started

```bash
cp .env.example .env
# Set VITE_API_URL and VITE_STRIPE_PUBLIC_KEY
npm install
npm run dev       # Web preview in browser
```

## Build & sync to Android

```bash
npm run build     # Build web assets
npm run sync      # npx cap sync android
npm run open      # Open Android Studio
```

## App structure

```
src/
  views/
    auth/           Login, Register
    onboarding/     4-step profession/location setup
    subscription/   Plans page, Stripe checkout
    tools/          CV, Interview, Videos, Statements, Advisor, Alerts
    profile/        Edit profile, Qualifications
    ApplicationsView.vue
    NotificationsView.vue
  stores/           auth, subscription
  composables/      usePaywall, usePushNotifications
  components/       PaywallGate, SkeletonCard, VideoCard, ErrorBoundary
```

## Plans & feature gates

| Feature | Free | Pro | Premium |
|---------|------|-----|---------|
| Job search | ✓ | ✓ | ✓ |
| Save jobs | 10 | ∞ | ∞ |
| Job alerts | 2 | ∞ | ∞ |
| CV upload | ✓ | ✓ | ✓ |
| AI CV analysis | ✗ | ✓ | ✓ |
| Supporting statements | ✗ | ✓ | ✓ |
| Interview prep | Basic | Full | Full |
| Video library | Limited | Full | Full |
| Career advisor | ✗ | ✗ | ✓ |

Features are enforced via `PaywallGate` component and backend `subscribed` middleware.

## Push notifications
Requires Firebase project. Add `google-services.json` to `android/app/`.
Device tokens are registered to the backend via `POST /api/v1/devices/register`.
