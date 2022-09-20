import React, { FC } from 'react';
import { SvgIconProps, useTheme } from '@mui/material';
import SearchBaseCard, { SearchBaseCardProps } from './SearchBaseCard';

export interface SearchJourneyCardProps extends Omit<SearchBaseCardProps, 'height' | 'imgHeight'> {
  icon: React.ComponentType<SvgIconProps>,
  name: string;
  taglineTitle: string;
  tagline: string;
  parentIcon?: React.ComponentType<SvgIconProps>;
  parentName?: string;
}

export const SearchJourneyCard: FC<SearchJourneyCardProps> = ({
  image, imgAlt, label, matchedTerms,
  icon, name,
  parentIcon, parentName,
  taglineTitle, tagline,
  url
}) => {
  const theme = useTheme();
  return (
    <SearchBaseCard
      height={theme.cards.search.journey.height}
      imgHeight={theme.cards.search.journey.imgHeight}
      image={image}
      imgAlt={imgAlt}
      label={label}
      icon={icon}
      name={name}
      matchedTerms={matchedTerms}
      url={url}
    >

    </SearchBaseCard>
  );
};
