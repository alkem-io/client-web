import { Box, Button } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gutters } from '../grid/utils';
import AutomaticOverflowGradient from '../overflow/AutomaticOverflowGradient';
import type { OverflowGradientProps } from '../overflow/OverflowGradient';
import WrapperMarkdown, { type WrapperMarkdownProps } from './WrapperMarkdown';

const DEFAULT_MAX_HEIGHT_GUTTERS = 6;

type OverflowState = 'detecting' | 'no-overflow' | 'expanded' | 'collapsed';

interface ExpandableMarkdownProps extends WrapperMarkdownProps {
  children: string;
  backgroundColor?: OverflowGradientProps['backgroundColor'];
  overflowMarker?: OverflowGradientProps['overflowMarker'];
  maxHeightGutters?: number;
  minHeightGutters?: number;
  defaultCollapsed?: boolean;
}

const ExpandableMarkdown = ({
  children,
  maxHeightGutters = DEFAULT_MAX_HEIGHT_GUTTERS,
  minHeightGutters = 0,
  backgroundColor = 'paper',
  overflowMarker,
  defaultCollapsed = false,
  ...props
}: ExpandableMarkdownProps) => {
  const { t } = useTranslation();
  // Start collapsed to measure overflow, then decide
  const [state, setState] = useState<OverflowState>('detecting');

  // Re-enter detecting when defaultCollapsed changes (e.g. setting loaded async or admin toggle)
  const prevDefaultCollapsedRef = useRef(defaultCollapsed);
  useEffect(() => {
    if (prevDefaultCollapsedRef.current !== defaultCollapsed) {
      prevDefaultCollapsedRef.current = defaultCollapsed;
      setState('detecting');
    }
  }, [defaultCollapsed]);

  const isCollapsed = state === 'detecting' || state === 'collapsed';
  const maxHeight = isCollapsed ? gutters(maxHeightGutters) : undefined;

  const handleOverflowChange = useCallback(
    (isOverflowing: boolean) => {
      if (state === 'detecting') {
        setState(isOverflowing ? (defaultCollapsed ? 'collapsed' : 'expanded') : 'no-overflow');
      }
    },
    [state, defaultCollapsed]
  );

  return (
    <>
      <AutomaticOverflowGradient
        maxHeight={maxHeight}
        minHeight={gutters(minHeightGutters)}
        backgroundColor={backgroundColor}
        overflowMarker={overflowMarker}
        onOverflowChange={handleOverflowChange}
        expanderButton={
          state === 'collapsed' ? (
            <Box textAlign="right">
              <Button variant="text" onClick={() => setState('expanded')}>
                {t('buttons.ellipsisReadMore')}
              </Button>
            </Box>
          ) : undefined
        }
      >
        <WrapperMarkdown card={true} {...props}>
          {children}
        </WrapperMarkdown>
      </AutomaticOverflowGradient>
      {state === 'expanded' && (
        <Box textAlign="right">
          <Button variant="text" onClick={() => setState('collapsed')}>
            {t('buttons.showLess')}
          </Button>
        </Box>
      )}
    </>
  );
};

export default ExpandableMarkdown;
