import { Box, type BoxProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PlatformFeatureFlagName } from '@/core/apollo/generated/graphql-schema';
import { gutters } from '@/core/ui/grid/utils';
import RouterLink from '@/core/ui/link/RouterLink';
import { BlockSectionTitle } from '@/core/ui/typography';
import { rem } from '@/core/ui/typography/utils';
import { useConfig } from '@/domain/platform/config/useConfig';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import LogoImage from '../logo/logo.svg?react';
import LogoPreviewImage from '../logo/logoPreview.svg?react';

interface PoweredByProps {
  preview?: boolean;
  compact?: boolean;
}

const PoweredBy = ({ compact = false, preview = false, sx, ...props }: PoweredByProps & BoxProps) => {
  const { t } = useTranslation();

  const { isFeatureEnabled, locations } = useConfig();
  const landingPageUrl = locations?.landing;

  const hasLandingPage = isFeatureEnabled(PlatformFeatureFlagName.LandingPage);

  const getLogoHeightGutters = () => {
    if (preview) {
      return 1.5;
    }
    if (compact) {
      return 0.5;
    }
    return 0.75;
  };

  return (
    <Box
      component={RouterLink}
      to={hasLandingPage ? landingPageUrl : ROUTE_HOME}
      raw={hasLandingPage}
      blank={false}
      display="flex"
      justifyContent="center"
      alignItems="center"
      gap={gutters(0.5)}
      paddingX={gutters(0.5)}
      sx={{
        svg: {
          height: gutters(getLogoHeightGutters()),
          width: 'auto',
        },
        ...sx,
      }}
      aria-label={t('components.poweredBy.aria-label')}
      {...props}
    >
      <BlockSectionTitle flexShrink={0} textTransform="uppercase" fontSize={compact ? rem(10) : undefined}>
        {t('components.poweredBy.label')}
      </BlockSectionTitle>
      {preview ? <LogoPreviewImage /> : <LogoImage />}
    </Box>
  );
};

export default PoweredBy;
