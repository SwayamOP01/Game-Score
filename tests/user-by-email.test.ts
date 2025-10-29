import { describe, it, expect } from "vitest";
import { GET as userByEmail } from "../app/api/user/by-email/route";

describe("user by email route", () => {
  it("requires email param", async () => {
    const res = await userByEmail(new Request("http://localhost/api/user/by-email"));
    expect(res.status).toBe(400);
  });
});