import { Box, BoxProps } from '@mui/material';
import { PlaceOutlined } from '@mui/icons-material';
import { compact } from 'lodash';
import { Caption } from '../typography';
import { COUNTRIES } from '../../../domain/common/location/countries.constants';

interface LocationCardSegmentProps {
  city?: string;
  countryCode?: string;
}

const LocationCardSegment = ({ city, countryCode, ...containerProps }: LocationCardSegmentProps & BoxProps) => {
  const countryName = COUNTRIES.find(({ code }) => code === countryCode)?.name;

  const locationString = compact([city, countryName]).join(', ');

  return (
    <Box display="flex" alignItems="center" {...containerProps}>
      <PlaceOutlined fontSize="small" sx={{ marginLeft: '-3px', marginRight: '7px' }} />
      <Caption>{locationString}</Caption>
    </Box>
  );
};

export default LocationCardSegment;
