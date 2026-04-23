import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import type { BreadcrumbTrailItem } from '@/crd/components/common/BreadcrumbsTrail';

type BreadcrumbsContextValue = {
  items: BreadcrumbTrailItem[];
  setItems: (items: BreadcrumbTrailItem[]) => void;
};

const BreadcrumbsContext = createContext<BreadcrumbsContextValue | null>(null);

function itemsEqual(a: BreadcrumbTrailItem[], b: BreadcrumbTrailItem[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].label !== b[i].label || a[i].href !== b[i].href || a[i].icon !== b[i].icon) {
      return false;
    }
  }
  return true;
}

export function BreadcrumbsProvider({ children }: { children: ReactNode }) {
  const [items, setItemsRaw] = useState<BreadcrumbTrailItem[]>([]);

  // Shallow-equal guard prevents update cycles when callers pass a fresh
  // array on every render (e.g., literals built in page layouts). Without
  // it, useSetBreadcrumbs could loop when the React Compiler fails to
  // memoize the caller's array.
  const setItems = (next: BreadcrumbTrailItem[]) => {
    setItemsRaw(prev => (itemsEqual(prev, next) ? prev : next));
  };

  const value = { items, setItems };
  return <BreadcrumbsContext.Provider value={value}>{children}</BreadcrumbsContext.Provider>;
}

export function useBreadcrumbs(): BreadcrumbTrailItem[] {
  const ctx = useContext(BreadcrumbsContext);
  if (!ctx) throw new Error('useBreadcrumbs must be used within BreadcrumbsProvider');
  return ctx.items;
}

export function useSetBreadcrumbs(items: BreadcrumbTrailItem[]) {
  const ctx = useContext(BreadcrumbsContext);
  if (!ctx) throw new Error('useSetBreadcrumbs must be used within BreadcrumbsProvider');
  const { setItems } = ctx;

  useEffect(() => {
    setItems(items);
    return () => setItems([]);
  }, [items, setItems]);
}
