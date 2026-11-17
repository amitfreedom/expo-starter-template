# Nest — Expo starter

A mobile-first TypeScript starter with light/dark themes, English/Hindi translations, shared UI components, and an end-to-end demo authentication flow.

## Create a new app from this template

Run this command to create a new Expo project with the screens, folder structure, themes, and translations included:

```sh
npx create-expo-app@latest my-new-app --template https://github.com/amitfreedom/expo-starter-template
```

Replace `my-new-app` with your project name, then start the app:

```sh
cd my-new-app
npm start
```

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

## Theme, language, and font size

Open **Profile → Preferences** to select **Light**, **Dark**, or **System**, and **English** or **हिन्दी**. Before login, expand **Theme and language** at the bottom of any screen. Selections apply immediately across all screens and are saved on this device with AsyncStorage, including after logout or restarting the app. System is the default theme and follows live device appearance changes; English is the default language.

Open **Profile → Preferences → Font size** to resize text across the app. Choose Small, Default, Large, Extra large, or Largest, or use the minus/plus controls for 5% adjustments between 85% and 150%. A live preview and reset button are included. The choice is saved with theme/language and applies to screens, inputs, buttons, dialogs, sheets, and bottom-tab labels, including after logout or restart.

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

## Reusable UI library

Common components live in `src/shared/components`: `AppText`, `Field`, `MultilineField`, `Button` (primary/secondary/outline/ghost), `Loader`, `AppModal`, `DialogBox`, and `BottomSheet`. Typography variants, font sizes, weights, spacing, and responsive scaling live in `src/shared/theme`.

Open **Profile → UI Components** to try the library in the app, including modal/dialog/sheet behavior and Hindi/dark-mode previews. See [the UI component guide](docs/ui-components.md) for props and usage examples.

## API services

TanStack Query + Axios are configured globally. Feature services import the single client from `src/shared/api/client.ts`; shared request/response interceptors manage token and language headers, error normalization, and authenticated `401` handling. All backend paths are defined in `src/shared/api/endpoints.ts`. Shared error helpers provide localized messages and form field validation errors. Logout clears the session and Query cache. Native focus and network changes are connected to Query's lifecycle managers. In development, interceptors print structured JSON request/response/error logs with sensitive fields masked; set `EXPO_PUBLIC_API_LOGGING=false` to disable them.

```sh
cp .env.example .env.local
```

Set `EXPO_PUBLIC_API_URL` in `.env.local` to your backend's base URL, then reload the app. See [the API guide](docs/api.md) for service/query/mutation examples, retry defaults, error handling, and real authentication integration. `features/profile` contains an example protected profile service and Query hooks; its endpoint contract must be adapted to your backend.

The login/OTP flow remains a working local demo using Query mutations. For real authentication, replace the demo service operations and form hook, then pass your backend's user and access token to `signIn`. Access tokens are held in memory; persistent login and token refresh need your backend's session strategy.

Change the light/dark palettes in `src/shared/theme/palettes.ts` for colors, `Brand` in `src/shared/components/Brand.tsx` for branding, and the Nest images in `assets/images` for launcher/splash artwork. Configure your own app name, slug, scheme, and application identifiers in `app.json` before distribution.

## Validation

```sh
npm test
npm run typecheck
npm run lint
npx expo-doctor
npx expo export --platform web
```

Built using the [official Expo starter](https://docs.expo.dev/more/create-expo/) and [Expo Router protected routes](https://docs.expo.dev/router/advanced/protected/).
