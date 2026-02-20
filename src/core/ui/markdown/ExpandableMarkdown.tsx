import WrapperMarkdown, { WrapperMarkdownProps } from './WrapperMarkdown';
import { gutters } from '../grid/utils';
import { OverflowGradientProps } from '../overflow/OverflowGradient';
import AutomaticOverflowGradient from '../overflow/AutomaticOverflowGradient';
import { Box, Button } from '@mui/material';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

const DEFAULT_MAX_HEIGHT_GUTTERS = 6;

type OverflowState = 'detecting' | 'no-overflow' | 'expanded' | 'collapsed';

interface ExpandableMarkdownProps extends WrapperMarkdownProps {
  children: string;
  backgroundColor?: OverflowGradientProps['backgroundColor'];
  overflowMarker?: OverflowGradientProps['overflowMarker'];
  maxHeightGutters?: number;
  minHeightGutters?: number;
}

const ExpandableMarkdown = ({
  children,
  maxHeightGutters = DEFAULT_MAX_HEIGHT_GUTTERS,
  minHeightGutters = 0,
  backgroundColor = 'paper',
  overflowMarker,
  ...props
}: ExpandableMarkdownProps) => {
  const { t } = useTranslation();
  // Start collapsed to measure overflow, then decide
  const [state, setState] = useState<OverflowState>('detecting');

  const isCollapsed = state === 'detecting' || state === 'collapsed';
  const maxHeight = isCollapsed ? gutters(maxHeightGutters) : undefined;

  const handleOverflowChange = useCallback(
    (isOverflowing: boolean) => {
      if (state === 'detecting') {
        setState(isOverflowing ? 'expanded' : 'no-overflow');
      }
    },
    [state]
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
        <WrapperMarkdown card {...props}>
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
