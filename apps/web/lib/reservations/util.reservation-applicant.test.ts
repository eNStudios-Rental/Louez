import assert from "node:assert/strict";
import { test } from "node:test";

import { getReservationApplicantName } from "./util.reservation-applicant";

test("uses the person who booked the reservation when available", () => {
  assert.equal(
    getReservationApplicantName("  Jan Kowalski  ", {
      firstName: "Ada",
      lastName: "Lovelace",
      companyName: null,
    }),
    "Jan Kowalski",
  );
});

test("falls back to the customer account name when no applicant is recorded", () => {
  assert.equal(
    getReservationApplicantName("  ", {
      firstName: "Ada",
      lastName: "Lovelace",
      companyName: "Example Ltd",
    }),
    "Ada Lovelace",
  );
  assert.equal(
    getReservationApplicantName(null, {
      firstName: null,
      lastName: null,
      companyName: "Example Ltd",
    }),
    "Example Ltd",
  );
});
