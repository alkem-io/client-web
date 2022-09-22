import React, { FC } from 'react';
import { BoxProps, styled, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import { ClampedTypography, ClampedTypographyProps } from '../../ClampedTypography';
import SearchBaseCard, { SearchBaseCardImplProps } from './SearchBaseCard';

const TaglineBox = styled(Box)<BoxProps & ClampedTypographyProps>({
  height: 100,
});

export interface SearchBaseJourneyCardProps extends SearchBaseCardImplProps {
  tagline?: string;
}

export const SearchBaseJourneyCard: FC<SearchBaseJourneyCardProps> = ({
  tagline,
  children,
  ...rest
}) => {
  const theme = useTheme();
  return (
    <SearchBaseCard
      height={theme.cards.search.journey.height}
      imgHeight={theme.cards.search.journey.imgHeight}
      { ...rest }
    >
      {tagline && (
        <TaglineBox component={ClampedTypography} clamp={4}>
          {tagline}
        </TaglineBox>
      )}
      {children}
    </SearchBaseCard>
  );
};
