import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getCategoryDisplayPath,
  includeCategoryAncestors,
  type CategoryHierarchyEntry,
} from "./category-hierarchy";

const categories: CategoryHierarchyEntry[] = [
  { id: "building", parentId: null, name: "Building" },
  { id: "furniture", parentId: "building", name: "Furniture" },
  { id: "chairs", parentId: "furniture", name: "Chairs" },
  { id: "garden", parentId: null, name: "Garden" },
];

describe("category hierarchy", () => {
  it("includes each selected category's ancestors without changing selection order", () => {
    assert.deepEqual(
      includeCategoryAncestors(["chairs", "garden", "chairs", "missing"], categories),
      ["chairs", "garden", "furniture", "building"],
    );
  });

  it("formats category names from the root to the selected category", () => {
    const categoriesById = new Map(categories.map((category) => [category.id, category]));

    assert.equal(getCategoryDisplayPath("chairs", categoriesById), "Building > Furniture > Chairs");
    assert.equal(getCategoryDisplayPath("missing", categoriesById), null);
  });

  it("handles malformed parent cycles without looping", () => {
    const cyclicCategories = [
      { id: "a", parentId: "b", name: "A" },
      { id: "b", parentId: "a", name: "B" },
    ];
    const categoriesById = new Map(cyclicCategories.map((category) => [category.id, category]));

    assert.deepEqual(includeCategoryAncestors(["a"], cyclicCategories), ["a", "b"]);
    assert.equal(getCategoryDisplayPath("a", categoriesById), "B > A");
  });
});
