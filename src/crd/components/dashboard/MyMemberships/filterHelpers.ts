import type { MembershipItem, MembershipRole } from './types';

export function matchesSearch(item: MembershipItem, query: string): boolean {
  if (!query) return true;
  const lower = query.toLowerCase();
  return item.name.toLowerCase().includes(lower) || (item.tagline?.toLowerCase().includes(lower) ?? false);
}

export function passesHardFilter(item: MembershipItem, roleFilter: string, visibilityFilter: string): boolean {
  if (roleFilter !== 'all' && !item.roles.includes(roleFilter as MembershipRole)) return false;
  if (visibilityFilter === 'public' && item.isPrivate) return false;
  if (visibilityFilter === 'private' && !item.isPrivate) return false;
  return true;
}

// Recursively filter the tree:
// - An item is kept only if it passes the hard filter (role + visibility). A failing
//   item is dropped along with its descendants, which matches the strict "show me only
//   admin / only public" mental model.
// - Among items that pass the hard filter, we keep the item if it matches the search
//   itself OR has any descendant that matches the search (the ancestor is shown as
//   context so the tree structure is preserved).
export function filterTree(
  items: MembershipItem[],
  search: string,
  roleFilter: string,
  visibilityFilter: string
): MembershipItem[] {
  const result: MembershipItem[] = [];

  for (const item of items) {
    if (!passesHardFilter(item, roleFilter, visibilityFilter)) continue;

    const filteredChildren = filterTree(item.children ?? [], search, roleFilter, visibilityFilter);
    const selfMatchesSearch = matchesSearch(item, search);

    if (!search || selfMatchesSearch || filteredChildren.length > 0) {
      result.push({ ...item, children: filteredChildren });
    }
  }

  return result;
}

export function countTreeItems(items: MembershipItem[]): number {
  let total = 0;
  for (const item of items) {
    total += 1 + countTreeItems(item.children ?? []);
  }
  return total;
}

export function collectAllIds(items: MembershipItem[]): string[] {
  const ids: string[] = [];
  for (const item of items) {
    ids.push(item.id);
    ids.push(...collectAllIds(item.children ?? []));
  }
  return ids;
}
