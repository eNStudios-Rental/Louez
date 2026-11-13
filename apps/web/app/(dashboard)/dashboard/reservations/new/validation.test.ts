import assert from "node:assert/strict";
import { test } from "node:test";

import { createManualReservationSchema } from "./validation";

const translate = (key: string) => key;
const validValues = {
  customerId: "customer-1",
  startDate: new Date("2026-07-02T07:00:00.000Z"),
  endDate: new Date("2026-07-04T17:00:00.000Z"),
  internalTitle: "",
  internalNotes: "",
};

test("manual reservation creation requires a non-empty booking person", () => {
  const schema = createManualReservationSchema(translate);

  assert.equal(schema.safeParse(validValues).success, false);
  assert.equal(schema.safeParse({ ...validValues, bookedByName: "   " }).success, false);

  const result = schema.safeParse({ ...validValues, bookedByName: "  Jan Kowalski  " });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.bookedByName, "Jan Kowalski");
  }
});
