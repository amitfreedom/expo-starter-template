# Project architecture

The project groups code by feature. Start with the feature you want to change; keep its implementation together. Add subfolders only when they have a real file to hold.

## Directory map

```text
src/
├── app/                         Expo Router routes and route metadata
│   ├── _layout.tsx              Startup entry and root anchor
│   ├── splash.tsx               Onboarding route
│   ├── (auth)/                  Login, signup, and OTP routes
│   └── (tabs)/                  Home, activity, and profile routes
├── core/                        Application composition
│   ├── navigation/              Root, authentication, and tab navigators
│   └── providers/               Provider order, navigation theme, system UI
├── features/
│   ├── auth/
│   │   ├── components/          Login/signup form UI
│   │   ├── hooks/               Form validation, submission, OTP/resend state
│   │   ├── providers/           Authentication session
│   │   ├── screens/             Login, signup, and OTP screens
│   │   ├── services/            Demo authentication adapter; replace with API
│   │   ├── types/               User and verification challenge models
│   │   └── index.ts             Public authentication exports
│   ├── onboarding/
│   │   └── screens/             Welcome screen and its local styles
│   ├── home/
│   │   ├── components/          Welcome card and getting-started checklist
│   │   └── screens/             Home screen composition
│   ├── activity/screens/        Activity timeline
│   ├── profile/screens/         Account details and profile UI
│   └── preferences/
│       ├── components/          Settings controls and page composition
│       └── index.ts             Public settings UI exports
└── shared/                      Code used across features
    ├── components/              Brand, Button, Field, ErrorText, Screen
    ├── theme/                   Palettes, shared styles, useUI hook
    ├── preferences/             App-wide theme/language state and storage
    └── i18n/
        ├── locales/hi.ts        Hindi translations of source English messages
        └── messages.ts          Typed message keys and interpolation
```

Assets and application configuration stay at the project root. Assets needed by Expo config, such as launcher and splash images, belong in `assets/`. Feature-specific assets can be kept next to the feature when they are introduced.

## Dependency direction

- `app` connects routes to `core` navigators and feature screens. Keep route files small; Expo route settings such as `unstable_settings` stay in `_layout.tsx`.
- `core` composes global providers and navigation. It can use feature public exports and shared modules.
- `features` contain product behavior. They can use shared modules and another feature's public exports, but cannot import `core` or route files.
- `shared` supplies app-wide foundations. It cannot depend on a feature, navigation composition, or routes.

ESLint enforces these boundaries for `@/` imports, including the rule against importing another feature's internals. Use the `@/` alias when crossing folders or layers; use relative imports within a feature or shared module. Avoid relative paths that escape into another feature or layer.

For example:

```tsx
// Another feature consumes authentication through its public API.
import { useAuth } from "@/features/auth";

// A screen imports a shared control directly.
import { Button } from "@/shared/components/Button";

// Inside auth, hooks can access their own implementation directly.
import { useAuthForm } from "../hooks/useAuthForm";
```

Export only what other features actually need from a feature's `index.ts`. Authentication exposes its provider, session hook, and domain types; preferences exposes its page and panel. Routes may import their feature screen directly. Shared components use direct imports instead of a large barrel that loads every component.

Avoid circular feature dependencies. If two features need the same independent capability, move that capability into a suitable shared module. Do not move a feature-specific component to `shared` simply because its file is getting large.

## Responsibilities

| Change                                 | Place                                        |
| -------------------------------------- | -------------------------------------------- |
| Screen layout                          | `features/<feature>/screens/`                |
| Feature-specific UI                    | `features/<feature>/components/`             |
| Stateful behavior and submission logic | `features/<feature>/hooks/`                  |
| API calls and response mapping         | `features/<feature>/services/`               |
| Feature models                         | `features/<feature>/types/`                  |
| Session state                          | `features/auth/providers/AuthProvider.tsx`   |
| Provider order                         | `core/providers/AppProviders.tsx`            |
| Route guards                           | `core/navigation/RootNavigator.tsx`          |
| Tab configuration                      | `core/navigation/TabsNavigator.tsx`          |
| Reusable UI                            | `shared/components/`                         |
| Theme colors and shared styles         | `shared/theme/`                              |
| Theme/language state                   | `shared/preferences/PreferencesProvider.tsx` |
| Preference persistence and validation  | `shared/preferences/preferences-storage.ts`  |
| Hindi copy                             | `shared/i18n/locales/hi.ts`                  |
| Translation types and formatting       | `shared/i18n/messages.ts`                    |

`Screen` is a layout primitive with an optional footer. `PreferencesPage` composes it with the settings panel. This keeps shared layout independent of the preferences feature while preserving settings access on every screen.

The authentication hooks own validation and asynchronous submission. The service owns the demo verification behavior. Screens display state and connect user actions to those hooks. Backend integration should replace the service and update the form hook rather than put network requests into JSX.

Preferences are intentionally app-wide: shared controls and every feature need the theme and language before login. Their state/storage live in `shared/preferences`; their visible controls live in `features/preferences`. The storage key remains `@nest/preferences/v1`, so existing selections continue to load after this refactor.

## Add a feature

For example, to add an Orders tab:

1. Create `src/features/orders/screens/OrdersScreen.tsx`. Add local `components`, `hooks`, `services`, or `types` only as the feature needs them.
2. Create `src/app/(tabs)/orders.tsx`:

   ```tsx
   export { default } from "@/features/orders/screens/OrdersScreen";
   ```

3. Add a `Tabs.Screen` entry in `src/core/navigation/TabsNavigator.tsx` with its title and icon. Add the title's Hindi translation in `src/shared/i18n/locales/hi.ts`.
4. If other features need an Orders capability, expose the smallest useful API from `src/features/orders/index.ts`.
5. Keep tests for feature behavior next to that feature when introducing them. Test user-visible behavior and API contracts, rather than duplicating JSX or implementation details.
6. Run `npm run lint` and `npm run typecheck`, then exercise the new flow. Use `npx expo export --platform all` to verify bundling across platforms when navigation, providers, or shared code changes.

Use PascalCase for React components and their files, `useSomething.ts` for hooks, and descriptive names for services and utilities. Co-locate screen-specific styles as `ScreenName.styles.ts`; reserve `shared/theme/styles.ts` for styles that multiple features actually use. Create a shared API client or additional state library when the application needs it; this starter does not require one just to define the folder structure.
