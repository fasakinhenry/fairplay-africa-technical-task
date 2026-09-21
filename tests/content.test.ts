import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { resetDatabase, startTestServer, uniqueEmail, type TestServer } from "./helpers/test-server.js";
import type { AuthResponseBody, ContentListResponseBody, ContentResponseBody } from "./helpers/types.js";

async function registerAndGetToken(server: TestServer): Promise<{ token: string; userId: string }> {
  const res = await fetch(`${server.baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Grace Hopper", email: uniqueEmail(), password: "supersecret1" }),
  });
  const body = (await res.json()) as AuthResponseBody;
  return { token: body.token, userId: body.user.id };
}

describe("Content API", () => {
  let server: TestServer;

  beforeAll(async () => {
    server = await startTestServer();
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it("rejects registering content without authentication", async () => {
    const res = await fetch(`${server.baseUrl}/api/content`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "My first article" }),
    });

    expect(res.status).toBe(401);
  });

  it("registers a piece of content for the authenticated user", async () => {
    const { token } = await registerAndGetToken(server);

    const res = await fetch(`${server.baseUrl}/api/content`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: "How I built this API",
        description: "A walkthrough of the FairPlay Africa technical task",
        type: "ARTICLE",
        url: "https://example.com/post",
      }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as ContentResponseBody;
    expect(body.content.title).toBe("How I built this API");
    expect(body.content.type).toBe("ARTICLE");
  });

  it("rejects content registration with an invalid payload", async () => {
    const { token } = await registerAndGetToken(server);

    const res = await fetch(`${server.baseUrl}/api/content`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: "" }),
    });

    expect(res.status).toBe(400);
  });

  it("retrieves only the authenticated user's content", async () => {
    const userA = await registerAndGetToken(server);
    const userB = await registerAndGetToken(server);

    await fetch(`${server.baseUrl}/api/content`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${userA.token}` },
      body: JSON.stringify({ title: "User A's content" }),
    });
    await fetch(`${server.baseUrl}/api/content`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${userB.token}` },
      body: JSON.stringify({ title: "User B's content" }),
    });

    const res = await fetch(`${server.baseUrl}/api/content`, {
      headers: { Authorization: `Bearer ${userA.token}` },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as ContentListResponseBody;
    expect(body.items).toHaveLength(1);
    expect(body.items[0]?.title).toBe("User A's content");
    expect(body.pagination.total).toBe(1);
  });

  it("retrieves a single registered content item by id", async () => {
    const { token } = await registerAndGetToken(server);

    const createRes = await fetch(`${server.baseUrl}/api/content`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: "Fetch me later" }),
    });
    const { content } = (await createRes.json()) as ContentResponseBody;

    const res = await fetch(`${server.baseUrl}/api/content/${content.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as ContentResponseBody;
    expect(body.content.id).toBe(content.id);
  });

  it("returns 404 when retrieving another user's content by id", async () => {
    const userA = await registerAndGetToken(server);
    const userB = await registerAndGetToken(server);

    const createRes = await fetch(`${server.baseUrl}/api/content`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${userA.token}` },
      body: JSON.stringify({ title: "User A's private content" }),
    });
    const { content } = (await createRes.json()) as ContentResponseBody;

    const res = await fetch(`${server.baseUrl}/api/content/${content.id}`, {
      headers: { Authorization: `Bearer ${userB.token}` },
    });

    expect(res.status).toBe(404);
  });

  it("returns 404 for a non-existent content id", async () => {
    const { token } = await registerAndGetToken(server);

    const res = await fetch(`${server.baseUrl}/api/content/00000000-0000-0000-0000-000000000000`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status).toBe(404);
  });
});
