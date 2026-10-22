import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeClientInput,
  stripSensitiveFromText,
  toBirthdayMmDd,
} from "@/lib/secure/sanitize";

describe("sanitize", () => {
  it("strips phone from notes", () => {
    const n = stripSensitiveFromText("联系13812345678确认");
    assert.ok(!n.includes("13812345678"));
  });

  it("birthday to MM-DD only", () => {
    assert.equal(toBirthdayMmDd("1985-07-22"), "07-22");
    assert.equal(toBirthdayMmDd("7月22日"), "07-22");
  });

  it("drops forbidden keys", () => {
    const s = sanitizeClientInput({
      displayName: "测试",
      phone: "13800000000",
      idCard: "110101199001011234",
      dob: "1990-05-06",
      amount: "10万",
    });
    assert.equal(s.displayName, "测试");
    assert.equal(s.birthdayMmDd, "05-06");
    assert.equal(s.amount, 100000);
    assert.ok(!("phone" in s));
  });
});
