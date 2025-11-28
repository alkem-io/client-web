import FloatingActionButtons from '@/core/ui/button/FloatingActionButtons';
import Footer from '@/main/ui/platformFooter/PlatformFooter';
import PlatformHelpButton from '@/main/ui/helpButton/PlatformHelpButton';
import Overlay from '@/core/ui/utils/Overlay';
import { Box, Card } from '@mui/material';
import Image from '@/core/ui/image/Image';
import FixedHeightLogo from './components/FixedHeightLogo';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import PageBannerCardWrapper from '@/core/ui/layout/pageBannerCard/PageBannerCardWrapper';
import { Text } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';

interface AuthenticationLayoutProps {
  children: ReactNode;
}

const AuthenticationLayout = ({ children }: AuthenticationLayoutProps) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Overlay sx={{ zIndex: 0 }} role="banner">
        <Image
          src="/alkemio-banner/global-banner.svg"
          alt={t('visuals-alt-text.alkemio-banner-alt')}
          sx={{ objectFit: 'cover', width: '100%', height: '464px' }}
        />
      </Overlay>
      <Gutters
        component="main"
        row
        fullHeight
        sx={{
          padding: { xs: 1, sm: 6 },
          zIndex: 999,
          flexDirection: { xs: 'column', sm: 'column', md: 'row' },
          justifyContent: { xs: 'flex-start', sm: 'flex-start', md: 'space-between' },
          minWidth: '375px',
          paddingX: { sm: 10, md: 20 },
          height: '100%',
          flexGrow: 1,
        }}
      >
        <PageBannerCardWrapper sx={{ maxWidth: { xs: '100%', sm: '100%', md: '260px' }, maxHeight: '114px' }}>
          <Gutters disablePadding gap={gutters(0.5)}>
            <FixedHeightLogo />
            <Text color="textSecondary" noWrap sx={{ paddingLeft: gutters(0.7) }}>
              {t('pages.registration.logo-subtitle')}
            </Text>
          </Gutters>
        </PageBannerCardWrapper>
        <Card
          sx={{
            maxWidth: { xs: '100%', sm: '100%', md: '444px' },
            minWidth: '375px',
            marginTop: { xs: 1, sm: 1, md: 20 },
            height: 'fit-content',
          }}
        >
          {children}
        </Card>
      </Gutters>
      <Footer sx={{ flexShrink: 0 }} />
      <FloatingActionButtons floatingActions={<PlatformHelpButton />} />
    </Box>
  );
};

export default AuthenticationLayout;
