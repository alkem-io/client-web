import { useMemo } from 'react';
import { useColumns } from '@/core/ui/grid/GridContext';

/**
 * Hook to calculate visible spaces and card columns based on grid layout
 * @returns Object containing visibleSpaces count and cardColumns width
 */
export const useSpaceCardLayout = () => {
  const columns = useColumns();

  // Calculate visible spaces and card columns based on total columns
  const { visibleSpaces, cardColumns } = useMemo(() => {
    if (columns >= 8) {
      return { visibleSpaces: 3, cardColumns: columns / 3 };
    } else if (columns >= 4) {
      return { visibleSpaces: 2, cardColumns: columns / 2 };
    } else {
      return { visibleSpaces: 1, cardColumns: columns };
    }
  }, [columns]);

  return { visibleSpaces, cardColumns };
};
