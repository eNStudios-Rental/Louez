import assert from "node:assert/strict";
import { test } from "node:test";

import { createCustomerSchema, customerSchema } from "./customer";

const translate = (key: string) => `validation.${key}`;

test("individual customers do not require an email address", () => {
  const individual = {
    customerType: "individual" as const,
    firstName: "Ada",
    lastName: "Lovelace",
  };

  assert.equal(customerSchema.safeParse(individual).success, true);
  assert.equal(createCustomerSchema(translate).safeParse(individual).success, true);
});

test("business customers require a valid NIP but not a company number or contact names", () => {
  const business = {
    customerType: "business" as const,
    companyName: "Example Ltd",
    vatNumber: "123-456-32-18",
  };

  assert.equal(customerSchema.safeParse(business).success, true);
  assert.equal(createCustomerSchema(translate).safeParse(business).success, true);
});

test("business customers reject a NIP with an invalid checksum", () => {
  const result = customerSchema.safeParse({
    customerType: "business",
    companyName: "Example Ltd",
    vatNumber: "1234563219",
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.issues[0]?.path[0], "vatNumber");
    assert.equal(result.error.issues[0]?.message, "validation.invalidNip");
  }
});
