import WrapperMarkdown, { WrapperMarkdownProps } from './WrapperMarkdown';
import { gutters } from '../grid/utils';
import { OverflowGradientProps } from '../overflow/OverflowGradient';
import AutomaticOverflowGradient from '../overflow/AutomaticOverflowGradient';
import { Box, Button } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const DEFAULT_MAX_HEIGHT_GUTTERS = 6;

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
  const [expanded, setExpanded] = useState(false);
  const maxHeight = expanded ? undefined : gutters(maxHeightGutters);

  return (
    <>
      <AutomaticOverflowGradient
        maxHeight={maxHeight}
        minHeight={gutters(minHeightGutters)}
        backgroundColor={backgroundColor}
        overflowMarker={overflowMarker}
        expanderButton={
          <Box textAlign="right">
            {!expanded && (
              <Button variant="text" onClick={() => setExpanded(true)}>
                {t('buttons.ellipsisReadMore')}
              </Button>
            )}
          </Box>
        }
      >
        <WrapperMarkdown card {...props}>
          {children}
        </WrapperMarkdown>
      </AutomaticOverflowGradient>
    </>
  );
};

export default ExpandableMarkdown;
