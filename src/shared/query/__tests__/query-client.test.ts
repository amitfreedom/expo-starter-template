import assert from "node:assert/strict";
import { test } from "node:test";
import { createQueryClient } from "../query-client";
import { ApiError } from "@/shared/api/api-error";

function createTestQueryClient() {
  const client = createQueryClient();
  // GC timers are unnecessary in these tests and would keep Node alive.
  client.setDefaultOptions({
    ...client.getDefaultOptions(),
    queries: { ...client.getDefaultOptions().queries, gcTime: Infinity },
  });
  return client;
}

test("fresh query results are cached and concurrent reads are deduplicated", async () => {
  const client = createTestQueryClient();
  let calls = 0;
  const options = {
    queryKey: ["profile", "user-1"],
    queryFn: async () => {
      calls++;
      return { name: "Alex" };
    },
  };
  try {
    const [a, b] = await Promise.all([
      client.fetchQuery(options),
      client.fetchQuery(options),
    ]);
    assert.deepEqual(a, b);
    assert.equal(calls, 1);
    await client.fetchQuery(options);
    assert.equal(calls, 1);
    await client.invalidateQueries({ queryKey: ["profile"] });
    await client.fetchQuery(options);
    assert.equal(calls, 2);
  } finally {
    client.clear();
  }
});
test("queries retry transient API failures but never validation, auth, or configuration failures", async () => {
  const client = createTestQueryClient();
  client.setDefaultOptions({
    queries: { ...client.getDefaultOptions().queries, retryDelay: 0 },
  });
  try {
    let calls = 0;
    const value = await client.fetchQuery({
      queryKey: ["transient"],
      queryFn: async () => {
        if (++calls < 3) throw new ApiError("Unavailable", { status: 503 });
        return "ok";
      },
    });
    assert.equal(value, "ok");
    assert.equal(calls, 3);
    for (const status of [401, 403, 404, 422, 429]) {
      let attempts = 0;
      await assert.rejects(
        client.fetchQuery({
          queryKey: ["failure", status],
          queryFn: async () => {
            attempts++;
            throw new ApiError("Rejected", { status });
          },
        }),
      );
      assert.equal(attempts, 1);
    }
    let attempts = 0;
    await assert.rejects(
      client.fetchQuery({
        queryKey: ["configuration"],
        queryFn: async () => {
          attempts++;
          throw new ApiError("Not configured", { code: "API_NOT_CONFIGURED" });
        },
      }),
    );
    assert.equal(attempts, 1);
  } finally {
    client.clear();
  }
});
test("query cache clearing cancels active requests and removes private data", async () => {
  const client = createTestQueryClient();
  let aborted = false;
  let markStarted: () => void = () => {};
  const started = new Promise<void>((resolve) => {
    markStarted = resolve;
  });
  client.setQueryData(["private"], { email: "private@example.com" });
  const pending = client.fetchQuery({
    queryKey: ["in-flight"],
    queryFn: ({ signal }) =>
      new Promise<never>((_, reject) => {
        markStarted();
        signal.addEventListener("abort", () => {
          aborted = true;
          reject(new Error("Aborted"));
        });
      }),
  });
  const rejection = assert.rejects(pending);
  await started;
  client.clear();
  await rejection;
  assert.equal(aborted, true);
  assert.equal(client.getQueryCache().getAll().length, 0);
});
test("mutations do not retry writes automatically", async () => {
  const client = createTestQueryClient();
  let calls = 0;
  try {
    const mutation = client.getMutationCache().build(client, {
      mutationFn: async () => {
        calls++;
        throw new ApiError("Unavailable", { status: 503 });
      },
    });
    await assert.rejects(mutation.execute(undefined));
    assert.equal(calls, 1);
  } finally {
    client.clear();
  }
});

test("long server backoff does not trigger an early automatic retry", async () => {
  const client = createTestQueryClient();
  let attempts = 0;
  try {
    await assert.rejects(
      client.fetchQuery({
        queryKey: ["server-backoff"],
        queryFn: async () => {
          attempts++;
          throw new ApiError("Unavailable", {
            status: 503,
            retryAfterSeconds: 90,
          });
        },
      }),
    );
    assert.equal(attempts, 1);
  } finally {
    client.clear();
  }
});
