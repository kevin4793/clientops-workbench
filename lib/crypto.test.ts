import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { encryptJson, decryptJson } from "@/lib/crypto";

describe("crypto", () => {
  before(() => {
    process.env.DATA_KEY =
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  });

  it("roundtrip", () => {
    const payload = { displayName: "测", amount: 1 };
    const enc = encryptJson(payload);
    const dec = decryptJson<typeof payload>(enc);
    assert.deepEqual(dec, payload);
  });
});
