# Nest — Expo starter

A mobile-first TypeScript starter with light/dark themes, English/Hindi translations, shared UI components, and an end-to-end demo authentication flow.

## Run

Use Node 24.3+ (recommended: `nvm use`, using the included `.nvmrc`) or Node 22.13+.

```sh
npm install
npm start
```

Scan the QR code with an Expo Go version compatible with the project's Expo SDK, or run a development build. Press `i` for the iOS simulator (macOS/Xcode), `a` for an Android emulator, or `w` for the web preview.

```sh
npm run ios
npm run android
npm run web
```

## Screens

- Splash/welcome screen, plus a matching native launch screen and app icon.
- Login and signup with name/email/password validation, password visibility, and submission states.
- Six-digit OTP verification with paste/autofill support, error feedback, a 30-second resend cooldown, and five-minute expiry.
- Home with personalized greeting, quick navigation, and an interactive getting-started checklist.
- Bottom navigation with Home, Activity, and Profile tabs.
- Profile with account details, template information, and logout.
- Protected routing: tabs require a verified demo session; logout removes access.

## Try the demo

1. Select **Let’s get started** or **Log in**.
2. Enter any valid email and a password with at least eight characters. Signup also requires a name.
3. Enter **123456** on the OTP screen.
4. Explore the tabs and log out from Profile.

Authentication is simulated: no account is created, no email/SMS is sent, and passwords are never stored. Login accepts arbitrary credentials that pass form validation. The session and checklist live in memory and reset when the app reloads. Activity entries are illustrative.

## Theme and language

Open **Profile → Preferences** to select **Light**, **Dark**, or **System**, and **English** or **हिन्दी**. Before login, expand **Theme and language** at the bottom of any screen. Selections apply immediately across all screens and are saved on this device with AsyncStorage, including after logout or restarting the app. System is the default theme and follows live device appearance changes; English is the default language.

Both languages cover screen content, navigation labels, form placeholders, validation errors, OTP messages/timers, and accessibility labels. Account names and email addresses stay as entered. Hindi uses spacing and line heights appropriate for Devanagari. Storage failures keep the app usable and show a message in Preferences.

Theme palettes live in `src/shared/theme/palettes.ts`, preference state in `src/shared/preferences/PreferencesProvider.tsx`, persistence in `src/shared/preferences/preferences-storage.ts`, and translations in `src/shared/i18n/locales/hi.ts`. Add a translation key and Hindi message there, then call `t(key, parameters)` from `useUI()` or `usePreferences()`. Translation keys are type checked and support placeholders such as `{seconds}`. Native launch artwork uses the device appearance; saved app overrides apply once preferences load.

## Project structure

The app uses a feature-based structure with small route files:

```text
src/
  app/          Expo Router routes and layout metadata
  core/         Application providers and navigation
  features/     Auth, onboarding, home, activity, profile, preferences
  shared/       Reusable UI, themes, app preferences, translations
```

Features own their screens, components, hooks, services, and types. ESLint checks import boundaries so shared modules stay independent and feature internals remain private. See [the architecture guide](docs/architecture.md) for the complete directory map, dependency rules, and steps to add a new feature.

## Connect your backend

Replace `src/features/auth/services/auth-service.ts` and update the submit handler in `src/features/auth/hooks/useAuthForm.ts` to call your signup/login endpoints with the entered credentials. Your server should issue a verification challenge and send the code. Verify OTP codes, expiry, resend limits, and retry limits on the server. Remove the hard-coded code and demo hints. Update `src/features/auth/providers/AuthProvider.tsx` to store and restore your session securely (for example, with Expo SecureStore on native) and revoke it on logout. Client-side route guards are for navigation; authorize every protected API request on the server.

Change the light/dark palettes in `src/shared/theme/palettes.ts` for colors, `Brand` in `src/shared/components/Brand.tsx` for branding, and the Nest images in `assets/images` for launcher/splash artwork. Configure your own app name, slug, scheme, and application identifiers in `app.json` before distribution.

## Validation

```sh
npm run typecheck
npm run lint
npx expo-doctor
npx expo export --platform web
```

Built using the [official Expo starter](https://docs.expo.dev/more/create-expo/) and [Expo Router protected routes](https://docs.expo.dev/router/advanced/protected/).
