import { Box, BoxProps } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { gutters } from '@core/ui/grid/utils';
import { BlockSectionTitle } from '@core/ui/typography';
import VirtualContributorLabel from '../../virtualContributor/VirtualContributorLabel';

export interface ProfileChipViewProps extends BoxProps {
  displayName: string | undefined;
  city?: string;
  country?: string;
  avatarUrl: string | undefined;
  selected?: boolean;
  virtualContributor?: boolean;
}

export const ProfileChipView: FC<ProfileChipViewProps> = ({
  displayName,
  city,
  country,
  avatarUrl,
  virtualContributor,
  selected,
  children,
  ...containerProps
}) => {
  const { t } = useTranslation();

  return (
    <Box
      {...containerProps}
      sx={theme => ({
        backgroundColor: selected ? theme.palette.highlight.light : undefined,
      })}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          height: gutters(3),
          alignItems: 'center',
        }}
      >
        <Box
          component="img"
          width={gutters(2)}
          height={gutters(2)}
          marginRight={gutters(1)}
          borderRadius={theme => `${theme.shape.borderRadius}px`}
          src={avatarUrl}
          loading="lazy"
          alt={t('common.avatar-of', { user: displayName })}
          aria-label={t('common.avatar-of', { user: displayName })}
        />
        <Box>
          <BlockSectionTitle>{displayName}</BlockSectionTitle>
          <BlockSectionTitle>
            {city && country ? `${city}, ` : city}
            {country}
          </BlockSectionTitle>
          {virtualContributor && <VirtualContributorLabel />}
        </Box>
        {children}
      </Box>
    </Box>
  );
};
