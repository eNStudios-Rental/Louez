import assert from "node:assert/strict";
import { test } from "node:test";

import { getAddressAutocomplete } from "./address";

test("address autocomplete includes named businesses and other place types", async (t) => {
  let requestBody: unknown;
  t.mock.method(globalThis, "fetch", async (_input: RequestInfo | URL, init?: RequestInit) => {
    requestBody = JSON.parse(String(init?.body));
    return new Response(
      JSON.stringify({
        suggestions: [
          {
            placePrediction: {
              placeId: "place-1",
              text: { text: "Enstudios, Main Street" },
              structuredFormat: {
                mainText: { text: "Enstudios" },
                secondaryText: { text: "Main Street" },
              },
            },
          },
        ],
      }),
    );
  });

  const result = await getAddressAutocomplete({
    query: "Enstudios",
    googlePlacesApiKey: "test-key",
  });

  assert.deepEqual(requestBody, { input: "Enstudios" });
  assert.deepEqual(result.suggestions, [
    {
      placeId: "place-1",
      description: "Enstudios, Main Street",
      mainText: "Enstudios",
      secondaryText: "Main Street",
    },
  ]);
});

test("address autocomplete falls back to the full result when structured text is absent", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(
        JSON.stringify({
          suggestions: [
            {
              placePrediction: {
                placeId: "place-2",
                text: { text: "Enstudios, Main Street" },
              },
            },
          ],
        }),
      ),
  );

  const result = await getAddressAutocomplete({
    query: "Enstudios",
    googlePlacesApiKey: "test-key",
  });

  assert.deepEqual(result.suggestions, [
    {
      placeId: "place-2",
      description: "Enstudios, Main Street",
      mainText: "Enstudios, Main Street",
      secondaryText: "",
    },
  ]);
});
