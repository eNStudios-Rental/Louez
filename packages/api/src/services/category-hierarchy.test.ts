import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getCategoryIdsWithDescendants,
  getCategoryDisplayPath,
  getProductIdsByCategoryAndAncestors,
  removeRedundantAssignedCategoryIds,
  type CategoryHierarchyEntry,
} from "./category-hierarchy";

const categories: CategoryHierarchyEntry[] = [
  { id: "building", parentId: null, name: "Building" },
  { id: "furniture", parentId: "building", name: "Furniture" },
  { id: "chairs", parentId: "furniture", name: "Chairs" },
  { id: "garden", parentId: null, name: "Garden" },
];

describe("category hierarchy", () => {
  it("expands selected categories to descendants at every depth", () => {
    assert.deepEqual(
      getCategoryIdsWithDescendants(["building", "garden", "building", "missing"], categories),
      ["building", "furniture", "chairs", "garden"],
    );
  });

  it("removes redundant assigned ancestors while keeping parent-only assignments", () => {
    assert.deepEqual(
      removeRedundantAssignedCategoryIds(
        ["building", "furniture", "chairs", "garden", "building"],
        categories,
      ),
      ["chairs", "garden"],
    );
    assert.deepEqual(removeRedundantAssignedCategoryIds(["building"], categories), ["building"]);
  });

  it("formats category names from the root to the selected category", () => {
    const categoriesById = new Map(categories.map((category) => [category.id, category]));

    assert.equal(getCategoryDisplayPath("chairs", categoriesById), "Building > Furniture > Chairs");
    assert.equal(getCategoryDisplayPath("missing", categoriesById), null);
  });

  it("counts each product once in each assigned category and its ancestors", () => {
    assert.deepEqual(
      getProductIdsByCategoryAndAncestors(categories, [
        { categoryId: "chairs", productId: "p1" },
        { categoryId: "furniture", productId: "p1" },
        { categoryId: "garden", productId: "p1" },
        { categoryId: "building", productId: "p2" },
      ]),
      new Map([
        ["chairs", ["p1"]],
        ["furniture", ["p1"]],
        ["building", ["p1", "p2"]],
        ["garden", ["p1"]],
      ]),
    );
  });

  it("handles malformed parent cycles without looping", () => {
    const cyclicCategories = [
      { id: "a", parentId: "b", name: "A" },
      { id: "b", parentId: "a", name: "B" },
    ];
    const categoriesById = new Map(cyclicCategories.map((category) => [category.id, category]));

    assert.deepEqual(getCategoryIdsWithDescendants(["a"], cyclicCategories), ["a", "b"]);
    assert.deepEqual(
      getProductIdsByCategoryAndAncestors(cyclicCategories, [
        { categoryId: "a", productId: "p1" },
      ]),
      new Map([
        ["a", ["p1"]],
        ["b", ["p1"]],
      ]),
    );
    assert.equal(getCategoryDisplayPath("a", categoriesById), "B > A");
  });
});
