import { FC } from 'react';
import { gutters } from '../grid/utils';
import { Caption } from '../typography';
import { LocationIcon } from '../../../domain/timeline/calendar/icons/LocationIcon';

interface LocationCaptionProps {
  city: string | undefined;
  country: string | undefined;
}

const LocationCaption: FC<LocationCaptionProps> = ({ city, country }: LocationCaptionProps) => {
  return (
    <>
      {city || country ? (
        <Caption>
          <LocationIcon color="primary" fontSize="small" sx={{ verticalAlign: 'bottom', marginRight: gutters(0.25) }} />
          {[city, country].join(', ')}
        </Caption>
      ) : null}
    </>
  );
};

export default LocationCaption;
