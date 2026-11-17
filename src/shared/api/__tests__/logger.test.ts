import assert from "node:assert/strict";
import { test } from "node:test";
import {
  AxiosError,
  AxiosHeaders,
  CanceledError,
  isCancel,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { createApiClient } from "../client";
import { createApiSession } from "../session";
import { ApiError } from "../api-error";
import { sanitizeLogValue } from "../logger";
function response(
  config: InternalAxiosRequestConfig,
  data: unknown = { ok: true },
  status = 200,
): AxiosResponse {
  return {
    config,
    data,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: new AxiosHeaders({
      "Content-Type": "application/json",
      "Set-Cookie": "private-cookie-value",
    }),
  };
}
test("interceptors log pretty JSON request and response with correlation IDs and masked credentials", async () => {
  const logs: string[] = [];
  const session = createApiSession();
  session.setAccessToken("private-bearer-value");
  session.setLanguage("hi");
  const client = createApiClient({
    baseURL: "https://backend.test/v1",
    session,
    logging: true,
    logWriter: (json) => logs.push(json),
  });
  const body = {
    title: "Example",
    password: "private-password-value",
    nested: { otp: "123456", code: "654321" },
  };
  client.defaults.adapter = async (config) => {
    assert.equal(JSON.parse(config.data).password, body.password);
    return response(config, {
      id: 1,
      name: "Example",
      accessToken: "private-response-token",
    });
  };
  const result = await client.post(
    "/users?api_key=private-query-value&sort=name",
    body,
    { params: { page: 2, refresh_token: "private-param-value" } },
  );
  assert.equal(body.password, "private-password-value");
  assert.equal(result.data.accessToken, "private-response-token");
  assert.equal(logs.length, 2);
  const [request, reply] = logs.map((json) => JSON.parse(json));
  assert.equal(request.scope, "api");
  assert.equal(request.event, "request");
  assert.equal(request.request.method, "POST");
  assert.equal(request.request.headers["Accept-Language"], "hi");
  assert.equal(request.request.headers.Authorization, "[REDACTED]");
  assert.deepEqual(request.request.payload, {
    title: "Example",
    password: "[REDACTED]",
    nested: { otp: "[REDACTED]", code: "[REDACTED]" },
  });
  assert.equal(request.request.params.page, 2);
  assert.equal(request.request.params.refresh_token, "[REDACTED]");
  assert.ok(request.request.url.includes("sort=name"));
  assert.equal(reply.event, "response");
  assert.equal(reply.requestId, request.requestId);
  assert.equal(reply.response.status, 200);
  assert.equal(reply.response.data.name, "Example");
  assert.equal(reply.response.data.accessToken, "[REDACTED]");
  assert.equal(reply.response.headers["Set-Cookie"], "[REDACTED]");
  assert.ok(reply.durationMs >= 0);
  assert.ok(logs[0].includes('\n  "scope"'));
  for (const secret of [
    "private-bearer-value",
    "private-password-value",
    "123456",
    "654321",
    "private-query-value",
    "private-param-value",
    "private-response-token",
    "private-cookie-value",
  ])
    assert.equal(logs.join("").includes(secret), false);
});
test("failed requests log JSON response details without changing normalized errors", async () => {
  const logs: string[] = [];
  const client = createApiClient({
    baseURL: "https://backend.test",
    logging: true,
    logWriter: (json) => logs.push(json),
  });
  client.defaults.adapter = async (config) => {
    throw new AxiosError(
      "Bad request",
      "ERR_BAD_REQUEST",
      config,
      undefined,
      response(
        config,
        {
          message: "Please check your email",
          secret: "private-error-value",
          errors: { email: ["Required"] },
        },
        422,
      ),
    );
  };
  await assert.rejects(
    client.get("/users"),
    (error: unknown) => error instanceof ApiError && error.status === 422,
  );
  const [request, failure] = logs.map((json) => JSON.parse(json));
  assert.equal(failure.event, "error");
  assert.equal(failure.requestId, request.requestId);
  assert.equal(failure.response.status, 422);
  assert.equal(failure.response.data.message, "Please check your email");
  assert.equal(failure.response.data.secret, "[REDACTED]");
  assert.equal(failure.error.kind, "validation");
});
test("preflight failures are logged once and cancellation keeps its own event and error identity", async () => {
  const logs: string[] = [];
  const invalid = createApiClient({
    baseURL: "",
    logging: true,
    logWriter: (json) => logs.push(json),
  });
  await assert.rejects(
    invalid.get("/users"),
    (error: unknown) =>
      error instanceof ApiError && error.code === "API_NOT_CONFIGURED",
  );
  assert.equal(logs.length, 2);
  const [request, failure] = logs.map((json) => JSON.parse(json));
  assert.equal(failure.requestId, request.requestId);
  assert.equal(failure.error.errorCode, "API_NOT_CONFIGURED");
  logs.length = 0;
  const client = createApiClient({
    baseURL: "https://backend.test",
    logging: true,
    logWriter: (json) => logs.push(json),
  });
  client.defaults.adapter = async (config) => {
    throw new CanceledError("Cancelled", config);
  };
  await assert.rejects(client.get("/users"), (error: unknown) =>
    isCancel(error),
  );
  const cancelled = JSON.parse(logs[1]);
  assert.equal(cancelled.event, "cancelled");
  assert.equal(cancelled.error.errorCode, "ERR_CANCELED");
});
test("disabled logging and a broken console writer cannot change request results", async () => {
  let calls = 0;
  const disabled = createApiClient({
    baseURL: "https://backend.test",
    logging: false,
    logWriter: () => {
      calls++;
    },
  });
  disabled.defaults.adapter = async (config) => response(config);
  assert.deepEqual((await disabled.get("/users")).data, { ok: true });
  assert.equal(calls, 0);
  const broken = createApiClient({
    baseURL: "https://backend.test",
    logging: true,
    logWriter: () => {
      throw new Error("Console unavailable");
    },
  });
  broken.defaults.adapter = async (config) => response(config);
  assert.deepEqual((await broken.get("/users")).data, { ok: true });
  broken.defaults.adapter = async (config) => {
    throw new AxiosError(
      "Failed",
      "ERR_BAD_RESPONSE",
      config,
      undefined,
      response(config, {}, 503),
    );
  };
  await assert.rejects(
    broken.get("/users"),
    (error: unknown) => error instanceof ApiError && error.status === 503,
  );
});
test("JSON strings, cycles, binary data, form data, and large payloads serialize safely without mutation", () => {
  const cyclic: Record<string, unknown> = {
    id: 1,
    token: "private-cyclic-value",
  };
  cyclic.self = cyclic;
  const value = sanitizeLogValue({
    cyclic,
    json: JSON.stringify({ password: "private-string-value", title: "ok" }),
    binary: new Uint8Array([1, 2]),
    bigint: BigInt(2),
    list: Array.from({ length: 150 }, (_, i) => i),
  });
  const json = JSON.stringify(value);
  assert.ok(json.includes("[Circular]"));
  assert.ok(json.includes("[Binary body omitted]"));
  assert.ok(json.includes("[Truncated]"));
  assert.equal(json.includes("private-cyclic-value"), false);
  assert.equal(json.includes("private-string-value"), false);
  assert.equal(cyclic.self, cyclic);
  assert.equal(cyclic.token, "private-cyclic-value");
  const form = new FormData();
  form.append("password", "private-form-value");
  assert.equal(sanitizeLogValue(form), "[FormData body omitted]");
});
