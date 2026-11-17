import assert from "node:assert/strict";
import { test } from "node:test";
import { AxiosError, AxiosHeaders, CanceledError } from "axios";
import { normalizeApiError, parseRetryAfter } from "../api-error";
import { getErrorMessage, getFieldErrorMessage } from "../error-messages";
import {
  translate,
  type MessageKey,
  type Language,
} from "@/shared/i18n/messages";
function failure(
  status: number,
  data: unknown = {},
  headers: Record<string, string> = {},
) {
  return new AxiosError(
    "Transport detail",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      status,
      statusText: "Error",
      data,
      headers: new AxiosHeaders(headers),
      config: { headers: new AxiosHeaders() },
    },
  );
}
const translator = (language: Language) => (key: MessageKey) =>
  translate(language, key);

test("HTTP errors receive a stable category regardless of backend error code", () => {
  for (const [status, kind] of [
    [400, "validation"],
    [401, "authentication"],
    [403, "authorization"],
    [404, "not-found"],
    [408, "timeout"],
    [409, "conflict"],
    [422, "validation"],
    [429, "rate-limit"],
    [500, "server"],
  ] as const) {
    const error = normalizeApiError(failure(status, { code: "NETWORK_ERROR" }));
    assert.equal(error.kind, kind);
    assert.equal(error.retryable, status === 408 || status === 500);
    assert.ok(getErrorMessage(error, translator("en")));
    assert.notEqual(
      getErrorMessage(error, translator("en")),
      getErrorMessage(error, translator("hi")),
    );
  }
});
test("server, configuration, and unknown JS errors do not expose technical details in UI", () => {
  const server = normalizeApiError(
    failure(500, {
      message: "SQL connection failed with internal credentials",
    }),
  );
  assert.equal(
    server.message,
    "SQL connection failed with internal credentials",
  );
  assert.equal(
    getErrorMessage(server, translator("en")),
    "The server is unavailable. Please try again later.",
  );
  const configuration = normalizeApiError(
    new AxiosError("Invalid option value", "ERR_BAD_OPTION_VALUE"),
  );
  assert.equal(configuration.kind, "configuration");
  assert.equal(configuration.retryable, false);
  assert.equal(
    getErrorMessage(configuration, translator("en")),
    "The app could not connect to the server. Please try again later.",
  );
  assert.equal(
    getErrorMessage(new Error("Internal JS stack"), translator("en")),
    "Something went wrong. Please try again.",
  );
});
test("validation payloads retain usable messages and fields, including nested error envelopes", () => {
  const error = normalizeApiError(
    failure(422, {
      error: {
        message: "Please correct the email",
        code: "EMAIL_INVALID",
        errors: {
          email: ["Required", "", 4],
          name: "Missing name",
          empty: [],
          ignored: {},
        },
      },
    }),
  );
  assert.equal(error.code, "EMAIL_INVALID");
  assert.deepEqual(error.fieldErrors, {
    email: ["Required"],
    name: ["Missing name"],
  });
  assert.equal(
    getErrorMessage(error, translator("en")),
    "Please correct the email",
  );
  assert.equal(
    getFieldErrorMessage(error, "email", translator("en")),
    "Required",
  );
  assert.equal(
    getFieldErrorMessage(error, "password", translator("en")),
    undefined,
  );
  const problem = normalizeApiError(
    failure(400, {
      title: "Invalid request",
      detail: "Please select a valid date",
    }),
  );
  assert.equal(
    getErrorMessage(problem, translator("en")),
    "Please select a valid date",
  );
});
test("malformed and HTML payloads use localized fallbacks rather than leaking response bodies", () => {
  for (const body of [
    "<html>Proxy error</html>",
    null,
    [],
    { message: { unsafe: true } },
    { message: "<script>bad()</script>" },
    { message: "Error\n    at internalFunction (server.js:1)" },
  ]) {
    const error = normalizeApiError(failure(400, body));
    assert.equal(
      getErrorMessage(error, translator("en")),
      "Please check the information you entered.",
    );
  }
});
test("Retry-After supports delay seconds and HTTP dates and is retained with rate-limit errors", () => {
  const now = Date.parse("2026-11-17T00:00:00Z");
  assert.equal(parseRetryAfter("30", now), 30);
  assert.equal(parseRetryAfter("Tue, 17 Nov 2026 00:00:45 GMT", now), 45);
  assert.equal(parseRetryAfter("Mon, 16 Nov 2026 00:00:00 GMT", now), 0);
  for (const invalid of ["", "-1", "1.5", "bad date", undefined])
    assert.equal(parseRetryAfter(invalid, now), undefined);
  const error = normalizeApiError(failure(429, {}, { "retry-after": "60" }));
  assert.equal(error.retryAfterSeconds, 60);
  assert.equal(error.retryable, false);
});
test("cancellation is silent, known messages translate live, and raw Axios errors can be displayed", () => {
  assert.equal(getErrorMessage(new CanceledError(), translator("hi")), null);
  assert.equal(getErrorMessage(null, translator("en")), null);
  const error = new Error("That code doesn’t match. Please try again.");
  assert.equal(getErrorMessage(error, translator("en")), error.message);
  assert.equal(
    getErrorMessage(error, translator("hi")),
    translate("hi", "That code doesn’t match. Please try again."),
  );
  const validation = normalizeApiError(
    failure(422, {
      errors: { email: ["Please enter a valid email address."] },
    }),
  );
  assert.equal(
    getFieldErrorMessage(validation, "email", translator("hi")),
    translate("hi", "Please enter a valid email address."),
  );
  assert.equal(
    getErrorMessage(
      new AxiosError("Network Error", "ERR_NETWORK"),
      translator("en"),
    ),
    "Unable to connect. Check your internet connection.",
  );
});

test("public login failures, missing credentials, and expired sessions have distinct messages", () => {
  const login = failure(401);
  login.config = { headers: new AxiosHeaders(), authMode: "none" };
  assert.equal(
    getErrorMessage(normalizeApiError(login), translator("en")),
    "Authentication failed. Please check your details.",
  );
  const anonymous = failure(401);
  anonymous.config = { headers: new AxiosHeaders() };
  assert.equal(
    getErrorMessage(normalizeApiError(anonymous), translator("en")),
    "Please log in to continue.",
  );
  const expired = failure(401);
  expired.config = {
    headers: new AxiosHeaders({ Authorization: "Bearer test-token" }),
  };
  assert.equal(
    getErrorMessage(normalizeApiError(expired), translator("en")),
    "Your session has expired. Please log in again.",
  );
});
