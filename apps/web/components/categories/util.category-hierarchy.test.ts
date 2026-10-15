import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildCategoryHierarchy } from "./util.category-hierarchy";

const categories = [
  { id: "boats", name: "Boats" },
  { id: "kayaks", parentId: "boats", name: "Kayaks" },
  { id: "sea-kayaks", parentId: "kayaks", name: "Sea kayaks" },
  { id: "paddles", parentId: "boats", name: "Paddles" },
  { id: "clothing", name: "Clothing" },
];

describe("buildCategoryHierarchy", () => {
  it("groups subcategories beneath their parents in source order", () => {
    assert.deepEqual(
      buildCategoryHierarchy(categories).map((group) =>
        group.map(({ category, depth, parentName }) => [category.id, depth, parentName]),
      ),
      [
        [
          ["boats", 0, null],
          ["kayaks", 1, "Boats"],
          ["sea-kayaks", 2, "Kayaks"],
          ["paddles", 1, "Boats"],
        ],
        [["clothing", 0, null]],
      ],
    );
  });

  it("keeps matching subcategories with their full parent path", () => {
    assert.deepEqual(
      buildCategoryHierarchy(categories, "sea kayaks").map((group) =>
        group.map(({ category }) => category.id),
      ),
      [["boats", "kayaks", "sea-kayaks"]],
    );
  });

  it("keeps every matching sibling in a searched hierarchy", () => {
    assert.deepEqual(
      buildCategoryHierarchy(categories, "a").map((group) =>
        group.map(({ category }) => category.id),
      ),
      [["boats", "kayaks", "sea-kayaks", "paddles"]],
    );
  });

  it("keeps orphaned and cyclic categories visible without duplicating them", () => {
    const malformedCategories = [
      { id: "orphan", parentId: "missing", name: "Orphan" },
      { id: "cycle-a", parentId: "cycle-b", name: "Cycle A" },
      { id: "cycle-b", parentId: "cycle-a", name: "Cycle B" },
    ];

    const rows = buildCategoryHierarchy(malformedCategories).flat();
    assert.deepEqual(
      rows.map(({ category }) => category.id),
      ["orphan", "cycle-a", "cycle-b"],
    );
    assert.equal(new Set(rows.map(({ category }) => category.id)).size, rows.length);
  });
});
