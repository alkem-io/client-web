import { FC } from 'react';
import { Caption } from '../typography';
import { LocationIcon } from '@/domain/timeline/calendar/icons/LocationIcon';

interface LocationCaptionProps {
  city?: string | undefined;
  country?: string | undefined;
}

const LocationCaption: FC<LocationCaptionProps> = ({ city, country }: LocationCaptionProps) => {
  return (
    <>
      {city || country ? (
        <Caption>
          <LocationIcon color="primary" fontSize="small" sx={{ verticalAlign: 'bottom', marginRight: 0.5 }} />
          {[city, country].filter(Boolean).join(', ')}
        </Caption>
      ) : null}
    </>
  );
};

export default LocationCaption;
