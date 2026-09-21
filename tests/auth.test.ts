import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { resetDatabase, startTestServer, uniqueEmail, type TestServer } from "./helpers/test-server.js";
import type { AuthResponseBody } from "./helpers/types.js";

describe("Auth API", () => {
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

  it("registers a new user and returns a token", async () => {
    const email = uniqueEmail();

    const res = await fetch(`${server.baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ada Lovelace", email, password: "supersecret1" }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as AuthResponseBody;
    expect(body.user.email).toBe(email);
    expect(typeof body.token).toBe("string");
  });

  it("rejects registering the same email twice", async () => {
    const email = uniqueEmail();
    const payload = { name: "Ada Lovelace", email, password: "supersecret1" };

    await fetch(`${server.baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await fetch(`${server.baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(409);
  });

  it("rejects registration with an invalid payload", async () => {
    const res = await fetch(`${server.baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "A", email: "not-an-email", password: "short" }),
    });

    expect(res.status).toBe(400);
  });

  it("logs in an existing user with correct credentials", async () => {
    const email = uniqueEmail();
    const password = "supersecret1";

    await fetch(`${server.baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ada Lovelace", email, password }),
    });

    const res = await fetch(`${server.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as AuthResponseBody;
    expect(typeof body.token).toBe("string");
  });

  it("rejects login with the wrong password", async () => {
    const email = uniqueEmail();

    await fetch(`${server.baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ada Lovelace", email, password: "supersecret1" }),
    });

    const res = await fetch(`${server.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "wrong-password" }),
    });

    expect(res.status).toBe(401);
  });
});
