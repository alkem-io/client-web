import { Caption } from '../typography';
import { LocationIcon } from '@/domain/timeline/calendar/icons/LocationIcon';

type LocationCaptionProps = {
  city?: string | undefined;
  country?: string | undefined;
};

const LocationCaption = ({ city, country }: LocationCaptionProps) => (
  <>
    {city || country ? (
      <Caption>
        <LocationIcon color="primary" fontSize="small" sx={{ verticalAlign: 'bottom', marginRight: 0.5 }} />
        {[city, country].filter(Boolean).join(', ')}
      </Caption>
    ) : null}
  </>
);

export default LocationCaption;
