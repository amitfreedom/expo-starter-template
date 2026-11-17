import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import { isCancel, AxiosError } from "axios";
import { createApiClient } from "../client";
import { ApiError, normalizeApiError } from "../api-error";
import { createApiSession } from "../session";
let baseURL: string;
const server = createServer((request, response) => {
  response.setHeader("Content-Type", "application/json");
  const send = (status: number, body: unknown) => {
    response.writeHead(status);
    response.end(JSON.stringify(body));
  };
  if (request.url === "/validation")
    return send(422, {
      message: "Email is already registered",
      code: "VALIDATION_ERROR",
      errors: { email: ["Already registered"], name: "Required", invalid: 4 },
    });
  if (request.url === "/unavailable") return send(503, {});
  if (request.url === "/unauthorized") return send(401, {});
  if (request.url === "/slow-unauthorized")
    return void setTimeout(() => send(401, {}), 60);
  if (request.url === "/slow") return void setTimeout(() => send(200, {}), 100);
  return send(200, {
    authorization: request.headers.authorization ?? null,
    language: request.headers["accept-language"],
    accept: request.headers.accept,
  });
});
before(async () => {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseURL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

test("common interceptors attach the latest token and language; public calls omit authentication", async () => {
  const session = createApiSession();
  const client = createApiClient({ baseURL, session });
  session.setAccessToken("first-token");
  session.setLanguage("hi");
  const first = await client.get("/ok");
  assert.deepEqual(first.data, {
    authorization: "Bearer first-token",
    language: "hi",
    accept: "application/json",
  });
  session.setAccessToken("second-token");
  session.setLanguage("en");
  const next = await client.get("/ok");
  assert.equal(next.data.authorization, "Bearer second-token");
  assert.equal(next.data.language, "en");
  const publicResponse = await client.get("/ok", { authMode: "none" });
  assert.equal(publicResponse.data.authorization, null);
});
test("required auth fails locally; configuration and third-party URLs cannot bypass the common client", async () => {
  const session = createApiSession();
  const client = createApiClient({ baseURL, session });
  let notifications = 0;
  session.subscribeUnauthorized(() => {
    notifications++;
  });
  await assert.rejects(
    client.get("/ok", { authMode: "required" }),
    (error: unknown) =>
      error instanceof ApiError && error.code === "AUTH_REQUIRED",
  );
  assert.equal(notifications, 0);
  session.setAccessToken("private-token");
  for (const url of [
    "https://example.com/secret",
    "//example.com/secret",
    "\\example.com/secret",
  ]) {
    await assert.rejects(
      client.get(url),
      (error: unknown) =>
        error instanceof ApiError && error.code === "INVALID_API_URL",
    );
  }
  await assert.rejects(
    client.get("/ok", { baseURL: "https://example.com" }),
    (error: unknown) =>
      error instanceof ApiError && error.code === "INVALID_API_URL",
  );
  await assert.rejects(
    createApiClient({ baseURL: "" }).get("/ok"),
    (error: unknown) =>
      error instanceof ApiError && error.code === "API_NOT_CONFIGURED",
  );
});
test("response errors preserve status, server message, and normalized field validation", async () => {
  const client = createApiClient({ baseURL });
  await assert.rejects(client.get("/validation"), (error: unknown) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 422);
    assert.equal(error.code, "VALIDATION_ERROR");
    assert.equal(error.message, "Email is already registered");
    assert.deepEqual(error.fieldErrors, {
      email: ["Already registered"],
      name: ["Required"],
    });
    assert.equal(error.retryable, false);
    return true;
  });
  await assert.rejects(
    client.get("/unavailable"),
    (error: unknown) =>
      error instanceof ApiError && error.status === 503 && error.retryable,
  );
});
test("only a current authenticated 401 notifies the session listener", async () => {
  const session = createApiSession();
  const client = createApiClient({ baseURL, session });
  let notifications = 0;
  const unsubscribe = session.subscribeUnauthorized(() => {
    notifications++;
    session.setAccessToken(null);
  });
  session.setAccessToken("old-token");
  const pending = client.get("/slow-unauthorized");
  // Allow the request interceptor to capture the old session.
  await new Promise((resolve) => setTimeout(resolve, 10));
  session.setAccessToken("new-token");
  await assert.rejects(pending);
  assert.equal(notifications, 0);
  assert.equal(session.getSnapshot().accessToken, "new-token");
  await assert.rejects(client.get("/unauthorized", { authMode: "none" }));
  assert.equal(notifications, 0);
  await assert.rejects(client.get("/unauthorized"));
  assert.equal(notifications, 1);
  assert.equal(session.getSnapshot().accessToken, null);
  unsubscribe();
});
test("timeout is normalized but AbortController cancellation remains recognizable to Axios", async () => {
  const client = createApiClient({ baseURL });
  await assert.rejects(
    client.get("/slow", { timeout: 10 }),
    (error: unknown) =>
      error instanceof ApiError && error.code === "TIMEOUT" && error.retryable,
  );
  const controller = new AbortController();
  const request = client.get("/slow", { signal: controller.signal });
  controller.abort();
  await assert.rejects(request, (error: unknown) => isCancel(error));
  const offline = normalizeApiError(
    new AxiosError("Network Error", "ERR_NETWORK"),
  );
  assert.equal(offline.code, "NETWORK_ERROR");
  assert.equal(offline.retryable, true);
});
