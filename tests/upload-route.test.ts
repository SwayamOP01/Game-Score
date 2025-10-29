import { describe, it, expect } from "vitest";
import { POST as upload } from "../app/api/upload/route";

describe("upload route", () => {
  it("rejects missing file", async () => {
    const fd = new FormData();
    fd.append("game", "BGMI");
    fd.append("region", "India");
    fd.append("userId", "u_123");
    const req = new Request("http://localhost/api/upload", { method: "POST", body: fd });
    const res = await upload(req);
    expect(res.status).toBe(400);
  });

  it("rejects missing fields", async () => {
    const blob = new Blob([new Uint8Array([0x00])], { type: "video/mp4" });
    const fd = new FormData();
    fd.append("file", blob, "a.mp4");
    const req = new Request("http://localhost/api/upload", { method: "POST", body: fd });
    const res = await upload(req);
    expect(res.status).toBe(400);
  });
});