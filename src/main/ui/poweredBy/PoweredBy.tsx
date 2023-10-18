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

interface PoweredByProps {
  preview?: boolean;
}

const PoweredBy = ({ preview, sx, ...props }: PoweredByProps & BoxProps) => {
  const { t } = useTranslation();

  const { isFeatureEnabled } = useConfig();

  const hasLandingPage = isFeatureEnabled(FEATURE_LANDING_PAGE);

  return (
    <Box
      component={RouterLink}
      to={hasLandingPage ? '/landing' : ROUTE_HOME}
      raw={hasLandingPage}
      blank={false}
      display="flex"
      alignItems="center"
      gap={gutters(0.5)}
      height={gutters(1.5)}
      paddingX={gutters(0.5)}
      sx={{
        svg: { width: gutters(preview ? 7 : 6) },
        ...sx,
      }}
      {...props}
    >
      <BlockSectionTitle flexShrink={0} textTransform="uppercase">
        {t('components.poweredBy.label')}
      </BlockSectionTitle>
      {preview ? <LogoPreviewImage /> : <LogoImage />}
    </Box>
  );
};

export default PoweredBy;
