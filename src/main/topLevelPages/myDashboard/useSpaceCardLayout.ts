import { useMemo } from 'react';
import { useColumns } from '@/core/ui/grid/GridContext';

/**
 * Hook to calculate visible spaces and card columns based on grid layout
 * Special layout for homepage: first card width aligns with InfoColumn (3 cols), remaining cards align with ContentColumn width
 * Standard layout for other views: uniform card width across all cards
 * @returns Object containing visibleSpaces count, cardColumns (standard 3-up grid), firstCardColumns, and remainingCardColumns (homepage special layout)
 */
export const useSpaceCardLayout = () => {
  const columns = useColumns();

  // Calculate visible spaces and card columns based on total columns
  const { visibleSpaces, cardColumns, firstCardColumns, remainingCardColumns } = useMemo(() => {
    if (columns >= 8) {
      // Desktop/tablet:
      // - Standard layout: 3 cards, each taking columns/3 (e.g., 4 cols each for 12-col grid)
      // - Homepage special layout: first card = 3 cols, remaining = 3 cols each
      return {
        visibleSpaces: 3,
        cardColumns: columns / 3,
        firstCardColumns: 3,
        remainingCardColumns: 3,
      };
    } else {
      // Mobile: 1 card at a time, full width
      return {
        visibleSpaces: 1,
        cardColumns: columns,
        firstCardColumns: columns,
        remainingCardColumns: columns,
      };
    }
  }, [columns]);

  return { visibleSpaces, cardColumns, firstCardColumns, remainingCardColumns };
};
