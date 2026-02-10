import { MouseEvent, useState } from 'react';
import { useScreenSize } from '@/core/ui/grid/constants';

const DEFAULT_MAX_VISIBLE_DESKTOP = 8;
const DEFAULT_MAX_VISIBLE_MOBILE = 4;

interface UseReactionsOverflowOptions<T> {
  reactions: T[];
  getCount?: (reaction: T) => number;
  maxVisibleDesktop?: number;
  maxVisibleMobile?: number;
}

interface UseReactionsOverflowResult<T> {
  visibleReactions: T[];
  overflowReactions: T[];
  overflowCount: number;
  hasOverflow: boolean;
  overflowAnchor: HTMLButtonElement | null;
  handleOpenOverflow: (event: MouseEvent<HTMLButtonElement>) => void;
  handleCloseOverflow: () => void;
  isOverflowOpen: boolean;
}

const useReactionsOverflow = <T>({
  reactions,
  getCount = () => 1,
  maxVisibleDesktop = DEFAULT_MAX_VISIBLE_DESKTOP,
  maxVisibleMobile = DEFAULT_MAX_VISIBLE_MOBILE,
}: UseReactionsOverflowOptions<T>): UseReactionsOverflowResult<T> => {
  const { isMediumSmallScreen } = useScreenSize();
  const maxVisible = isMediumSmallScreen ? maxVisibleMobile : maxVisibleDesktop;

  const [overflowAnchor, setOverflowAnchor] = useState<HTMLButtonElement | null>(null);

  const visibleReactions = reactions.slice(0, maxVisible);
  const overflowReactions = reactions.slice(maxVisible);
  const overflowCount = overflowReactions.reduce((sum, r) => sum + getCount(r), 0);

  const handleOpenOverflow = (event: MouseEvent<HTMLButtonElement>) => {
    setOverflowAnchor(event.currentTarget);
  };

  const handleCloseOverflow = () => {
    setOverflowAnchor(null);
  };

  return {
    visibleReactions,
    overflowReactions,
    overflowCount,
    hasOverflow: overflowCount > 0,
    overflowAnchor,
    handleOpenOverflow,
    handleCloseOverflow,
    isOverflowOpen: Boolean(overflowAnchor),
  };
};

export default useReactionsOverflow;
