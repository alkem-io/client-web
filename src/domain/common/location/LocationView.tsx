import React, { FC } from 'react';
import WrapperTypography from '../../../core/ui/typography/deprecated/WrapperTypography';
import { useTranslation } from 'react-i18next';
import { Location } from './Location';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { Box, Palette, SvgIconProps } from '@mui/material';

export interface LocationViewProps {
  location: Partial<Location> | string | undefined;
  mode?: 'icon' | 'label';
  color?: SvgIconProps['color'] & keyof Palette;
  iconSize?: SvgIconProps['fontSize'];
}

/**
 * @deprecated - use LocationCaption instead
 */
const LocationView: FC<LocationViewProps> = ({ location, mode = 'label', color = 'primary', iconSize = 'medium' }) => {
  const { t } = useTranslation();

  if (!location) {
    return null;
  }

  let locationString = '';
  if (typeof location === 'string') {
    locationString = location;
  } else {
    const city = location.city || '';
    const country = location.country?.code || '';

    locationString = [city, country].filter(x => !!x).join(', ');
  }
  if (!locationString) {
    return null;
  }

  switch (mode) {
    case 'icon': {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }} title={t('components.profile.fields.location.title')}>
          <LocationOnOutlinedIcon color={color} fontSize={iconSize} />
          <WrapperTypography>{locationString}</WrapperTypography>
        </Box>
      );
    }
    case 'label': {
      return (
        <>
          <WrapperTypography color={color} weight="boldLight" aria-label="Location">
            {t('components.profile.fields.location.title')}
          </WrapperTypography>
          <WrapperTypography>{locationString}</WrapperTypography>
        </>
      );
    }
  }
};

export default LocationView;
