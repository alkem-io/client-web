import { useState } from 'react';

/**
 * Tracks which rows have a save in flight, so a save blocks only its own row
 * instead of every row in the list.
 */
export function usePendingRows() {
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(() => new Set());

  const run = async <T>(rowId: string, action: () => Promise<T>): Promise<T> => {
    setPendingIds(prev => new Set(prev).add(rowId));
    try {
      return await action();
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(rowId);
        return next;
      });
    }
  };

  return { isPending: (rowId: string) => pendingIds.has(rowId), run };
}
