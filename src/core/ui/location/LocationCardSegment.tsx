import { PlaceOutlined } from '@mui/icons-material';
import { Box, type BoxProps } from '@mui/material';
import { COUNTRIES } from '@/domain/common/location/countries.constants';
import { Caption } from '../typography';
import getLocationString from './getLocationString';

type LocationCardSegmentProps = {
  city?: string;
  countryCode?: string;
};

const LocationCardSegment = ({ city, countryCode, ...containerProps }: LocationCardSegmentProps & BoxProps) => {
  const countryName = COUNTRIES.find(({ code }) => code === countryCode)?.name;

  const locationString = getLocationString({ city, country: countryName });

  return (
    <Box display="flex" alignItems="center" {...containerProps}>
      <PlaceOutlined fontSize="small" sx={{ marginLeft: '-3px', marginRight: '7px' }} />
      <Caption>{locationString}</Caption>
    </Box>
  );
};

export default LocationCardSegment;
