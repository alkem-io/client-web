import { Box, BoxProps } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { gutters } from '../../../../../core/ui/grid/utils';
import { BlockSectionTitle } from '../../../../../core/ui/typography';

export interface ProfileViewProps extends BoxProps {
  displayName: string | undefined;
  city: string | undefined;
  country: string | undefined;
  avatarUrl: string | undefined;
}

export const ProfileView: FC<ProfileViewProps> = ({
  displayName,
  city,
  country,
  avatarUrl,
  children,
  ...containerProps
}) => {
  const { t } = useTranslation();

  return (
    <Box {...containerProps}>
      <Box sx={{ display: 'flex', flexDirection: 'row', height: gutters(3), alignItems: 'center' }}>
        <Box
          component="img"
          width={gutters(2)}
          height={gutters(2)}
          mr={gutters(1)}
          src={avatarUrl}
          loading="lazy"
          alt={t('common.avatar-of', { user: displayName })}
        />
        <Box>
          <BlockSectionTitle>{displayName}</BlockSectionTitle>
          <BlockSectionTitle>
            {city && country ? `${city}, ` : city}
            {country}
          </BlockSectionTitle>
        </Box>
        {children}
      </Box>
    </Box>
  );
};
