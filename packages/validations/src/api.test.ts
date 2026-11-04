import assert from "node:assert/strict";
import { test } from "node:test";

process.env.SKIP_ENV_VALIDATION = "true";

const productId = "qdO2S5tJdj9ZbfSMcp61n";

const apiSchemas = import("./api");

test("accepts supported reservation payment method filters", async () => {
  const { dashboardReservationsListInputSchema } = await apiSchemas;

  for (const paymentMethod of ["stripe", "cash", "card", "transfer", "check", "other"]) {
    const result = dashboardReservationsListInputSchema.parse({ paymentMethod });
    assert.equal(result.paymentMethod, paymentMethod);
  }

  assert.throws(() => dashboardReservationsListInputSchema.parse({ paymentMethod: "crypto" }));
});

test("normalizes manual reservation customer emails before validation", async () => {
  const { dashboardReservationCreateManualReservationInputSchema } = await apiSchemas;
  const result = dashboardReservationCreateManualReservationInputSchema.parse({
    payload: {
      newCustomer: {
        email: " CELINE@EXAMPLE.COM ",
        firstName: "celine",
        lastName: "Toiseux",
      },
      startDate: "2026-07-02T07:00:00.000Z",
      endDate: "2026-07-04T17:00:00.000Z",
      items: [{ productId, quantity: 4 }],
    },
  });

  assert.equal(result.payload.newCustomer?.email, "celine@example.com");
});

test("keeps rejecting malformed manual reservation customer emails", async () => {
  const { dashboardReservationCreateManualReservationInputSchema } = await apiSchemas;

  assert.throws(() =>
    dashboardReservationCreateManualReservationInputSchema.parse({
      payload: {
        newCustomer: {
          email: "celine@example.",
          firstName: "celine",
          lastName: "Toiseux",
        },
        startDate: "2026-07-02T07:00:00.000Z",
        endDate: "2026-07-04T17:00:00.000Z",
        items: [{ productId, quantity: 4 }],
      },
    }),
  );
});

test("normalizes manual Tulip quote preview customer emails", async () => {
  const { dashboardReservationPreviewManualTulipQuoteInputSchema } = await apiSchemas;

  const result = dashboardReservationPreviewManualTulipQuoteInputSchema.parse({
    payload: {
      newCustomer: {
        email: " CELINE@EXAMPLE.COM ",
        firstName: "celine",
        lastName: "Toiseux",
      },
      startDate: "2026-07-02T07:00:00.000Z",
      endDate: "2026-07-04T17:00:00.000Z",
      items: [{ productId, quantity: 4 }],
    },
  });

  assert.equal(result.payload.newCustomer?.email, "celine@example.com");
});

test("accepts optional bookedByName in manual reservation create and update", async () => {
  const {
    dashboardReservationCreateManualReservationInputSchema,
    dashboardReservationUpdateReservationInputSchema,
  } = await apiSchemas;

  const createResult = dashboardReservationCreateManualReservationInputSchema.parse({
    payload: {
      customerId: "qdO2S5tJdj9ZbfSMcp61a",
      startDate: "2026-07-02T07:00:00.000Z",
      endDate: "2026-07-04T17:00:00.000Z",
      items: [{ productId, quantity: 1 }],
      bookedByName: " Jan Kowalski ",
    },
  });

  assert.equal(createResult.payload.bookedByName, "Jan Kowalski");

  const updateResult = dashboardReservationUpdateReservationInputSchema.parse({
    reservationId: "qdO2S5tJdj9ZbfSMcp61b",
    payload: {
      bookedByName: " Anna Nowak ",
    },
  });

  assert.equal(updateResult.payload.bookedByName, "Anna Nowak");
});
