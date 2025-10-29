import { describe, it, expect } from "vitest";
import { POST as signup } from "../app/api/auth/signup/route";

function req(body: Record<string, unknown>) {
  return new Request("http://localhost/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("signup route", () => {
  it("rejects invalid payload", async () => {
    const res = await signup(new Request("http://x", { method: "POST" }));
    expect(res.status).toBe(400);
  });

  it("rejects short password", async () => {
    const res = await signup(req({ email: "test@example.com", password: "123" }));
    expect(res.status).toBe(400);
  });
});