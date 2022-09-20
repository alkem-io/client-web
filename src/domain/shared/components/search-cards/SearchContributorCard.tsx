import React, { FC } from 'react';
import { useTheme } from '@mui/material';
import SearchBaseCard, { SearchBaseCardProps } from './SearchBaseCard';

export interface SearchContributorCardProps extends Omit<SearchBaseCardProps, 'height' | 'imgHeight'> {
  country: string;
  city: string;
}

const SearchContributorCard: FC<SearchContributorCardProps> = ({
  image, imgAlt, label, matchedTerms,
  icon, name,
  country, city,
  url
}) => {
  const theme = useTheme();
  return (
    <SearchBaseCard
      height={theme.cards.search.contributor.height}
      imgHeight={theme.cards.search.contributor.imgHeight}
      image={image}
      imgAlt={imgAlt}
      icon={icon}
      name={name}
      label={label}
      matchedTerms={matchedTerms}
      url={url}
    >

    </SearchBaseCard>
  );
};
export default SearchContributorCard;
