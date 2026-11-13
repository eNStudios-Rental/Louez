import assert from "node:assert/strict";
import { test } from "node:test";

import { isValidPolishNip } from "./polish-nip";

test("validates Polish NIP numbers and accepts common separators", () => {
  assert.equal(isValidPolishNip("1234563218"), true);
  assert.equal(isValidPolishNip("123-456-32-18"), true);
  assert.equal(isValidPolishNip("123 456 32 18"), true);
});

test("rejects malformed or checksum-invalid Polish NIP numbers", () => {
  assert.equal(isValidPolishNip("1234563219"), false);
  assert.equal(isValidPolishNip("123456321"), false);
  assert.equal(isValidPolishNip("PL1234563218"), false);
});
