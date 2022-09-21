import React, { FC } from 'react';
import { BoxProps, styled, SvgIconProps, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import { ClampedTypography, ClampedTypographyProps } from '../../ClampedTypography';
import SearchBaseCard, { SearchBaseCardProps } from './SearchBaseCard';

const TaglineBox = styled(Box)<BoxProps & ClampedTypographyProps>({
  height: 100,
});

export interface SearchBaseJourneyCardProps extends Omit<SearchBaseCardProps, 'height' | 'imgHeight' | 'label'> {
  icon: React.ComponentType<SvgIconProps>,
  name: string;
  tagline: string;
  parentIcon?: React.ComponentType<SvgIconProps>;
  parentName?: string;
  isMember: boolean;
}

export const SearchBaseJourneyCard: FC<SearchBaseJourneyCardProps> = ({
  image, imgAlt, isMember,
  icon, name,
  parentIcon: ParentIcon, parentName,
  tagline,
  matchedTerms, url
}) => {
  const theme = useTheme();
  return (
    <SearchBaseCard
      height={theme.cards.search.journey.height}
      imgHeight={theme.cards.search.journey.imgHeight}
      image={image}
      imgAlt={imgAlt}
      label={isMember ? 'Member' : undefined} // todo translate
      icon={icon}
      name={name}
      matchedTerms={matchedTerms}
      url={url}
    >
      <TaglineBox component={ClampedTypography} clamp={4}>
        {tagline}
      </TaglineBox>
      <Box sx={{ display: 'flex', alignItems: 'center', paddingTop: '14px', }}>
        {ParentIcon && <ParentIcon fontSize="small" sx={{ mr: 0.5 }} />}
        {parentName && (
          <ClampedTypography clamp={1} variant="caption" sx={{ textTransform: 'Uppercase' }}>
            {parentName}
          </ClampedTypography>
        )}
      </Box>
    </SearchBaseCard>
  );
};
