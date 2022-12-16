import React from 'react';
import { Box } from '@mui/material';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import RouterLink from '../../../../core/ui/link/RouterLink';

interface CalloutsListTitleProps {
  displayName: string;
  contributionsCount: number;
  calloutUrl: string;
}

const CalloutsListTitle = ({ displayName, contributionsCount, calloutUrl }: CalloutsListTitleProps) => {
  return (
    <Box display="flex" gap={0.5} flexGrow={1} minWidth={0}>
      <BlockSectionTitle flexShrink={1} component={RouterLink} to={calloutUrl} noWrap>
        {displayName}
      </BlockSectionTitle>
      <BlockSectionTitle flexShrink={0}>({contributionsCount})</BlockSectionTitle>
    </Box>
  );
};

export default CalloutsListTitle;
