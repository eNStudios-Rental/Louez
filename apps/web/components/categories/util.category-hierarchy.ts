export interface CategoryHierarchyItem {
  id: string;
  parentId?: string | null;
  name: string;
}

export interface CategoryHierarchyRow<T extends CategoryHierarchyItem> {
  category: T;
  depth: number;
  parentName: string | null;
}

/**
 * Orders categories into parent-first groups. When searching, matched
 * subcategories retain their ancestor rows so their context stays visible.
 */
export const buildCategoryHierarchy = <T extends CategoryHierarchyItem>(
  categories: readonly T[],
  search = "",
): CategoryHierarchyRow<T>[][] => {
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const childrenByParentId = new Map<string, T[]>();
  const roots: T[] = [];

  for (const category of categories) {
    const parentId = category.parentId;
    if (!parentId || parentId === category.id || !categoriesById.has(parentId)) {
      roots.push(category);
      continue;
    }

    const children = childrenByParentId.get(parentId) ?? [];
    children.push(category);
    childrenByParentId.set(parentId, children);
  }

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const visited = new Set<string>();
  const groups: CategoryHierarchyRow<T>[][] = [];

  const visit = (
    category: T,
    depth: number,
    parentName: string | null,
    group: CategoryHierarchyRow<T>[],
  ): boolean => {
    if (visited.has(category.id)) return false;
    visited.add(category.id);

    const rowIndex = group.length;
    group.push({ category, depth, parentName });

    let childMatches = false;
    for (const child of childrenByParentId.get(category.id) ?? []) {
      childMatches = visit(child, depth + 1, category.name, group) || childMatches;
    }
    const matches =
      normalizedSearch.length === 0 || category.name.toLocaleLowerCase().includes(normalizedSearch);

    if (matches || childMatches) return true;

    group.splice(rowIndex);
    return false;
  };

  const addGroup = (category: T) => {
    const group: CategoryHierarchyRow<T>[] = [];
    if (visit(category, 0, null, group)) groups.push(group);
  };

  for (const root of roots) addGroup(root);

  // Categories in a parent cycle have no natural root; display them once
  // rather than dropping them or recursing indefinitely.
  for (const category of categories) {
    if (!visited.has(category.id)) addGroup(category);
  }

  return groups;
};
