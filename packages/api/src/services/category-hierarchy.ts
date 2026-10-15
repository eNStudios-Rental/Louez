export interface CategoryHierarchyEntry {
  id: string;
  parentId: string | null;
  name: string;
}

export function includeCategoryAncestors(
  requestedIds: readonly string[],
  categories: readonly CategoryHierarchyEntry[],
): string[] {
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const resolved = Array.from(
    new Set(requestedIds.filter((id) => categoriesById.has(id))),
  );
  const included = new Set(resolved);

  for (const categoryId of resolved) {
    let parentId = categoriesById.get(categoryId)?.parentId ?? null;
    const visited = new Set([categoryId]);

    while (parentId && !visited.has(parentId)) {
      visited.add(parentId);
      const parent = categoriesById.get(parentId);
      if (!parent) break;
      if (!included.has(parent.id)) {
        included.add(parent.id);
        resolved.push(parent.id);
      }
      parentId = parent.parentId;
    }
  }

  return resolved;
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
    category = category.parentId
      ? categoriesById.get(category.parentId)
      : undefined;
  }

  return path.length > 0 ? path.reverse().join(" > ") : null;
}
