# API services: TanStack Query + Axios

All feature services share `apiClient` from `src/shared/api/client.ts`. The common request and response interceptors live in `src/shared/api/interceptors.ts`. TanStack Query owns server-state caching and request lifecycle; Axios owns transport, headers, timeout, and error normalization.

## Configure your backend

```sh
cp .env.example .env.local
```

Set your actual backend URL in `.env.local`, then reload the app:

```dotenv
EXPO_PUBLIC_API_URL=https://your-backend.example.com/v1
```

Expo bundles `EXPO_PUBLIC_` values into the client. Store only public configuration here; tokens come from authentication at runtime. The default request timeout is 15 seconds. Missing backend configuration throws `ApiError` with code `API_NOT_CONFIGURED` when a request is attempted; the demo app still starts without a backend.

On a physical device, use a backend address reachable from that device. `localhost` on a phone refers to the phone itself.

## File map

```text
src/
  shared/
    config/env.ts                         Public API configuration
    api/
      client.ts                           Single application Axios instance
      endpoints.ts                        Central registry of every backend path
      error-messages.ts                   Localized UI and field error helpers
      interceptors.ts                     Common request/response interception
      logger.ts                           Structured JSON logging and redaction
      session.ts                          Current token/language and 401 events
      api-error.ts                        Consistent errors and retry policy
      __tests__/client.test.ts             Local HTTP server integration tests
    query/
      query-client.ts                     Cache/retry defaults
      __tests__/query-client.test.ts       Cache, cancellation, retry tests
  core/providers/AppQueryProvider.tsx      QueryClientProvider and native lifecycle
  features/
    auth/providers/AuthProvider.tsx        Demo mutations, signIn, logout, 401 cleanup
    profile/
      services/profile-service.ts         Example GET/PATCH /users/me
      hooks/useProfile.ts                 Queries, keys, and mutation invalidation
```

## Common endpoint registry

Define every backend path in `src/shared/api/endpoints.ts`, grouped by feature. Existing profile services use `API_ENDPOINTS.profile.me`; the auth group contains example login/signup/OTP paths for future backend integration. These auth paths do not turn the local demo into live authentication.

```ts
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import { apiClient } from "@/shared/api/client";

const { data } = await apiClient.get(API_ENDPOINTS.profile.me, {
  authMode: "required",
});
```

Change paths in this registry when your backend changes. Keep the host/version prefix in `EXPO_PUBLIC_API_URL`. Add a function to a registry group for dynamic path segments when needed, using `encodeURIComponent` on identifiers. ESLint rejects literal endpoint arguments in feature service calls such as `apiClient.get('/users/me')`.

## Common interceptor behavior

The request interceptor:

- Reads the current access token for each request and attaches `Authorization: Bearer <token>` when available.
- Adds `Accept: application/json` and the current `Accept-Language` (`en` or `hi`). Axios handles JSON request bodies automatically; the client does not force a content type on uploads.
- Enforces the configured backend and relative endpoint paths, so this client cannot attach its token to an arbitrary absolute URL or per-request base URL override.
- Supports `authMode: 'required'`, `'optional'` (default), or `'none'`. Required requests fail locally without a token. Use `none` for login, signup, and other public endpoints.

The response interceptor:

- Returns Axios responses unchanged. Services unwrap `response.data`, keeping backend-specific response mapping inside each feature.
- Normalizes failures into `ApiError`, with `message`, `messageKey`, `status`, `code`, `kind`, `fieldErrors`, `details`, `retryAfterSeconds`, and `retryable`.
- Preserves Axios cancellation errors rather than converting cancellation into a network failure.
- Notifies the session layer on a `401` from a request that carried the current session token. The auth provider clears the token, user, verification state, and Query cache. Public `401` responses and late `401` responses from an older session do not log out a newer user.

Interceptors are installed when the common instance is created, not on every render. ESLint prevents feature services from importing Axios directly. Import the shared client instead of creating another Axios instance.

## JSON API logs

The common interceptors log requests, responses, failures, and cancellations through `src/shared/api/logger.ts`. In Expo development mode, these appear as pretty-printed JSON in the JavaScript console (React Native DevTools, or browser DevTools for web).

Request entries include a UTC timestamp, `requestId`, method, backend URL, timeout, headers, query `params`, and the JSON `payload`. Response entries reuse the same ID and include `durationMs`, status, headers, and parsed JSON `data`. Existing query parameters in the URL are sanitized; Axios `params` are logged separately without running a custom parameter serializer a second time. Every retry has its own request ID.

Example request entry (abbreviated):

```json
{
  "scope": "api",
  "event": "request",
  "requestId": "api-example-1",
  "request": {
    "method": "POST",
    "url": "https://api.example.com/v1/auth/login",
    "payload": {
      "email": "alex@example.com",
      "password": "[REDACTED]"
    }
  }
}
```

Matching response entry (abbreviated):

```json
{
  "scope": "api",
  "event": "response",
  "requestId": "api-example-1",
  "durationMs": 120,
  "response": {
    "status": 200,
    "data": {
      "user": { "name": "Alex" },
      "accessToken": "[REDACTED]"
    }
  }
}
```

Errors use `event: "error"`, a normalized `errorCode`/kind/message, and the server's response status, headers, and JSON data when present. Cancellations use `event: "cancelled"` and remain cancellation errors to the caller. Failures before a request is sent are logged as one request attempt plus one error.

Authorization/cookie headers, password/secret/API-key/token fields, OTP/verification fields, and sensitive query parameters are masked recursively in both payloads and responses. A generic `code` field is also masked because OTP APIs frequently use that name; normalized error codes remain visible as `errorCode`. User information in ordinary fields, such as a name or email, is still logged in development. Review the redaction rule if your backend uses other confidential field names.

Circular references and non-JSON/binary bodies are represented by markers. FormData contents are omitted. Large arrays, strings, objects, and deeply nested payloads are bounded to keep console logging usable. Logging works on sanitized copies and never modifies the request or returned response; a serialization or console-writer failure does not break the API call.

Logging is on by default in Expo development mode and off by default in production. To disable development logs, set this in `.env.local` and reload:

```dotenv
EXPO_PUBLIC_API_LOGGING=false
```

The environment flag does not enable logging in production. The `createApiClient` factory accepts `logging` and `logWriter` overrides for isolated tests or an explicitly configured custom client. The standard application instance uses the development-only default.

## Feature service pattern

The included profile service assumes these **example backend contracts**:

- `GET /users/me` returns `{ "name": "Alex", "email": "alex@example.com" }`.
- `PATCH /users/me` accepts `{ "name": "Alex" }` and returns the updated user.

Adapt those paths and response types/mapping to your backend. No backend is included. The demo Profile screen continues to show the local demo user; it does not call these example endpoints automatically.

For another feature, first add its paths to `API_ENDPOINTS`. For example, add a `products` group with `list: '/products'`, then keep transport calls in that feature's service:

```ts
import { apiClient } from "@/shared/api/client";
import { API_ENDPOINTS } from "@/shared/api/endpoints";

type Product = { id: string; title: string };

export async function getProducts(signal?: AbortSignal): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>(API_ENDPOINTS.products.list, {
    signal,
    authMode: "required",
  });
  return data;
}
```

Then use the service in a feature hook:

```ts
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../services/product-service";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: ({ signal }) => getProducts(signal),
  });
}
```

`queryFn` must return the service promise. Pass its `signal` through to Axios so unmounts, cancellation, and logout can abort active reads. Include filters, pagination, user identity, and language in query keys when they affect the result. The supplied `useProfile` demonstrates user/language keys and waits for a configured backend and authenticated session. Mutations use `useMutation`; invalidate related query keys after successful writes, as shown by `useUpdateProfile`.

## Connect real authentication

The existing OTP flow remains a local demo and now runs through TanStack Query mutations. It does not validate real credentials or produce an access token. Its demo mutations use `networkMode: 'always'` because they are local and should work offline.

For a real login:

1. Add your login/signup/verification endpoints to the auth service using the shared client with `authMode: 'none'`.
2. Replace the demo submit/verification operations with API mutations. Real network mutations should use the normal online mode.
3. When your backend finishes authentication, call the auth context's `signIn` with its result:

   ```tsx
   const { signIn } = useAuth();

   // Inside a real login mutation's onSuccess callback:
   signIn({ user: result.user, accessToken: result.accessToken });
   ```

4. Call `signOut()` to clear the in-memory token and cached server state. The same cleanup runs automatically for current authenticated `401` responses.

`signIn` also clears prior cached data when switching accounts. Tokens deliberately live in memory in this starter and are not written to AsyncStorage or environment variables. If persistent login is required, add a native secure-storage/web session strategy in your authentication implementation and restore the session before authenticated queries run. Remove persisted tokens when logging out. This starter does not implement token refresh because no refresh endpoint or backend contract has been supplied; a backend that supports refresh can extend the common response interceptor centrally.

## Query defaults and lifecycle

- Query data stays fresh for 60 seconds; unused cache entries are collected after five minutes.
- Failed queries retry at most twice for network failures, timeouts, and HTTP `408`, `500`, `502`, `503`, or `504`, with exponential delay. For retryable responses, `Retry-After` values up to 30 seconds are respected. A longer requested backoff stops automatic retries; let the user try again later.
- Authentication, authorization, validation, configuration, and rate-limit errors are not retried automatically. Handle HTTP `429` according to your backend's rate-limit policy.
- Mutations do not retry automatically, avoiding repeated writes. Completed unused mutations have a zero garbage-collection delay.
- Browser focus/reconnect use TanStack Query's built-in events. Native apps connect `AppState` and Expo Network to the focus/online managers and clean up subscriptions on unmount.
- One QueryClient is created per mounted application provider. Server-state cache is in memory and cleared at logout; it is not persisted across app restarts.

## Error handling in screens and forms

Keep the original error object when catching a failure so status, category, validation fields, and retry metadata survive:

```tsx
try {
  await mutation.mutateAsync(input);
} catch (error) {
  setError(error);
}

// The shared component accepts unknown errors, including Query errors.
<ErrorText error={error} />;
```

`getErrorMessage(error, t)` and `ErrorText` use Hindi/English messages for network failures, timeouts, missing/expired authentication, forbidden/not-found responses, rate limits, server failures, and invalid configuration. Public authentication failures have a separate message from expired authenticated sessions. Cancellation is silent. Unknown JS exceptions, HTML responses, and server diagnostics are not shown as raw UI text.

For HTTP 400/409/422 business validation, safe backend messages are displayed; the backend can localize arbitrary messages according to `Accept-Language`. Known translation keys are translated locally. The normalizer accepts `{ message, code, errors }`, nested `{ error: { message, code, errors } }`, and problem-details-style `title`/`detail` with an optional errors map. Field values can be a string or an array of strings; malformed, blank, HTML, or stack-trace entries are ignored.

```tsx
import { getFieldErrorMessage } from "@/shared/api/error-messages";

<Field
  label={t("Email address")}
  value={email}
  onChangeText={setEmail}
  error={getFieldErrorMessage(error, "email", t)}
/>;
```

The shared field displays validation text with an error border and accessibility hint. The auth form is already wired for `name`, `email`, and `password` field errors and clears stale errors when the user edits. The OTP screen also keeps the original failure, so switching languages updates its error message without another request.

HTTP status determines `kind` and retry eligibility independently of backend-provided `code`, so a server code cannot turn a validation failure into a retryable network error. `Retry-After` supports both delay seconds and HTTP dates. Raw response `details` remain available for controlled diagnostics. Do not log authorization headers, credentials, or complete request configs.

## Verify

```sh
npm test
npm run typecheck
npm run lint
npx expo-doctor
npx expo export --platform all
```

Tests use an ephemeral local HTTP server, not a live backend. They exercise header updates, public/protected requests, URL/configuration guards, validation errors, timeout/cancellation, current and stale authenticated `401` responses, query deduplication/caching, retry limits, mutation behavior, cancellation/cache cleanup, localized error classification, malformed payloads, validation fields, and Retry-After handling.

References: [Axios interceptors](https://axios-http.com/docs/interceptors), [TanStack Query on React Native](https://tanstack.com/query/latest/docs/framework/react/react-native), [Expo environment variables](https://docs.expo.dev/guides/environment-variables/).
