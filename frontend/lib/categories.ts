import type { Category } from "@/lib/types";

export interface CategoryTree extends Category {
  children: Category[];
}

export function parentId(category: Category): string | null {
  if (!category.parent) return null;
  return typeof category.parent === "string" ? category.parent : category.parent._id;
}

export function nestCategories(categories: Category[]): CategoryTree[] {
  const childrenByParent = new Map<string, Category[]>();

  for (const category of categories) {
    const parent = parentId(category);
    if (!parent) continue;
    const list = childrenByParent.get(parent) ?? [];
    list.push(category);
    childrenByParent.set(parent, list);
  }

  return categories
    .filter((category) => !parentId(category))
    .map((category) => ({
      ...category,
      children: (childrenByParent.get(category._id) ?? []).sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function categoryIdsInTree(node: CategoryTree): string[] {
  return [node._id, ...node.children.map((child) => child._id)];
}
