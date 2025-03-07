import { Caption } from '../typography';
import { LocationIcon } from '@/domain/timeline/calendar/icons/LocationIcon';

type LocationCaptionProps = {
  city?: string | undefined;
  country?: string | undefined;
  color?: string;
};

const LocationCaption = ({ city, country, color = 'primary' }: LocationCaptionProps) => (
  <>
    {city || country ? (
      <Caption color={color}>
        <LocationIcon fontSize="small" sx={{ verticalAlign: 'bottom', marginRight: 0.5 }} />
        {[city, country].filter(Boolean).join(', ')}
      </Caption>
    ) : null}
  </>
);

export default LocationCaption;
