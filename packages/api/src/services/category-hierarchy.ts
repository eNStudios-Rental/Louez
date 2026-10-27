export interface CategoryHierarchyEntry {
  id: string;
  parentId: string | null;
  name: string;
}

export function getCategoryIdsWithDescendants(
  requestedIds: readonly string[],
  categories: readonly CategoryHierarchyEntry[],
): string[] {
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const childrenByParentId = new Map<string, string[]>();
  for (const category of categories) {
    if (!category.parentId || !categoriesById.has(category.parentId)) continue;
    const children = childrenByParentId.get(category.parentId) ?? [];
    children.push(category.id);
    childrenByParentId.set(category.parentId, children);
  }

  const resolved: string[] = [];
  const included = new Set<string>();
  const addDescendants = (categoryId: string) => {
    if (included.has(categoryId) || !categoriesById.has(categoryId)) return;
    included.add(categoryId);
    resolved.push(categoryId);
    for (const childId of childrenByParentId.get(categoryId) ?? []) {
      addDescendants(childId);
    }
  };

  for (const categoryId of requestedIds) addDescendants(categoryId);
  return resolved;
}

export function removeRedundantAssignedCategoryIds(
  requestedIds: readonly string[],
  categories: readonly CategoryHierarchyEntry[],
): string[] {
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const uniqueIds = Array.from(new Set(requestedIds));
  const selectedIds = new Set(uniqueIds);

  return uniqueIds.filter((categoryId) => {
    let parentId = categoriesById.get(categoryId)?.parentId ?? null;
    const visited = new Set<string>([categoryId]);

    while (parentId && !visited.has(parentId)) {
      visited.add(parentId);
      if (selectedIds.has(parentId)) return false;
      parentId = categoriesById.get(parentId)?.parentId ?? null;
    }

    return true;
  });
}

export function getProductIdsByCategoryAndAncestors(
  categories: readonly CategoryHierarchyEntry[],
  assignments: readonly { categoryId: string; productId: string }[],
): Map<string, string[]> {
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const productIdsByCategoryId = new Map<string, Set<string>>();

  for (const assignment of assignments) {
    let category = categoriesById.get(assignment.categoryId);
    const visited = new Set<string>();

    while (category && !visited.has(category.id)) {
      visited.add(category.id);
      const productIds = productIdsByCategoryId.get(category.id) ?? new Set<string>();
      productIds.add(assignment.productId);
      productIdsByCategoryId.set(category.id, productIds);
      category = category.parentId ? categoriesById.get(category.parentId) : undefined;
    }
  }

  const result = new Map<string, string[]>();
  for (const [categoryId, productIds] of productIdsByCategoryId) {
    result.set(categoryId, [...productIds]);
  }
  return result;
}

export function getCategoryDisplayPath(
  categoryId: string,
  categoriesById: ReadonlyMap<string, CategoryHierarchyEntry>,
): string | null {
  const path: string[] = [];
  const visited = new Set<string>();
  let category = categoriesById.get(categoryId);

  while (category && !visited.has(category.id)) {
    visited.add(category.id);
    path.push(category.name);
    category = category.parentId ? categoriesById.get(category.parentId) : undefined;
  }

  return path.length > 0 ? path.reverse().join(" > ") : null;
}
