import { useTranslation } from 'react-i18next';
import { BlockSectionTitle } from '../../../core/ui/typography';
import { ReactComponent as LogoPreviewImage } from '../logo/logoPreview.svg';
import { ReactComponent as LogoImage } from '../logo/logo.svg';
import { gutters } from '../../../core/ui/grid/utils';
import { Box, BoxProps } from '@mui/material';
import { useConfig } from '../../../domain/platform/config/useConfig';
import { FEATURE_LANDING_PAGE } from '../../../domain/platform/config/features.constants';
import { ROUTE_HOME } from '../../../domain/platform/routes/constants';
import RouterLink from '../../../core/ui/link/RouterLink';
import { rem } from '../../../core/ui/typography/utils';

interface PoweredByProps {
  preview?: boolean;
  compact?: boolean;
}

const PoweredBy = ({ compact = false, preview = false, sx, ...props }: PoweredByProps & BoxProps) => {
  const { t } = useTranslation();

  const { isFeatureEnabled } = useConfig();

  const hasLandingPage = isFeatureEnabled(FEATURE_LANDING_PAGE);

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
      to={hasLandingPage ? '/landing' : ROUTE_HOME}
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
