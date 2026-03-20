import { Box, type BoxProps, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import RouterLink from '@/core/ui/link/RouterLink';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import { env } from '@/main/env';
import LogoImage from '../../logo/logoPreview.svg?react';

export interface LogoComponentProps extends BoxProps {
  url?: string;
}

const Logo = styled(LogoImage)(() => ({ height: '100%' }));

const DEFAULT_URL = env?.VITE_APP_ALKEMIO_DOMAIN ? env.VITE_APP_ALKEMIO_DOMAIN + ROUTE_HOME : ROUTE_HOME;

const LogoComponent = ({ url = DEFAULT_URL, ...rest }: LogoComponentProps) => {
  const { t } = useTranslation();
  return (
    <Box {...rest}>
      <RouterLink to={url} aria-label={t('buttons.home')}>
        <Logo />
      </RouterLink>
    </Box>
  );
};

export default LogoComponent;
