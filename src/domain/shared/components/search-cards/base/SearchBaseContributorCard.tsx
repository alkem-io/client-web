import React, { FC, useMemo } from 'react';
import { styled, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SearchBaseCard, { SearchBaseCardImplProps } from './SearchBaseCard';

const LocationBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  height: theme.typography.subtitle2.fontSize,
}));

export interface SearchBaseContributorCardProps extends SearchBaseCardImplProps {
  country?: string;
  city?: string;
}

const SearchBaseContributorCard: FC<SearchBaseContributorCardProps> = ({
  image,
  imgAlt,
  label,
  matchedTerms,
  icon,
  name,
  country,
  city,
  url,
}) => {
  const theme = useTheme();

  const location = useMemo(() => {
    if (!country) {
      return city;
    } else if (!city) {
      return country;
    } else {
      return `${city}, ${country}`;
    }
  }, [city, country]);
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
      {location && (
        <LocationBox>
          <LocationOnOutlinedIcon fontSize={'inherit'} />
          <Typography variant={'subtitle2'}>{location}</Typography>
        </LocationBox>
      )}
    </SearchBaseCard>
  );
};

export default SearchBaseContributorCard;
