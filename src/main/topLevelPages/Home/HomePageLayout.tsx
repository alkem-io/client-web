import React, { PropsWithChildren } from 'react';
import Footer from '../../ui/platformFooter/PlatformFooter';
import FloatingActionButtons from '../../../core/ui/button/FloatingActionButtons';
import PlatformHelpButton from '../../ui/helpButton/PlatformHelpButton';
import PlatformNavigationBar from '../../ui/platformNavigation/PlatformNavigationBar';
import PageBanner from '../../../core/ui/layout/pageBanner/PageBanner';
import Breadcrumbs from '../../../core/ui/navigation/Breadcrumbs';
import BreadcrumbsRootItem from '../../ui/breadcrumbs/BreadcrumbsRootItem';
import PageBannerCard from '../pageBannerCard/PageBannerCard';
import { useTranslation } from 'react-i18next';
import { HomeOutlined } from '@mui/icons-material';
import { Visual } from '../../../domain/common/visual/Visual';

const banner: Visual = {
  uri: '/public/alkemio-banner/global-banner.jpg',
};

const HomePageLayout = ({ children }: PropsWithChildren<{}>) => {
  const { t } = useTranslation();

  return (
    <>
      <PlatformNavigationBar
        breadcrumbs={
          <Breadcrumbs>
            <BreadcrumbsRootItem />
          </Breadcrumbs>
        }
      />
      <PageBanner
        banner={banner}
        cardComponent={PageBannerCard}
        title={t('pages.home.title')}
        iconComponent={HomeOutlined}
      />
      {children}
      <Footer />
      <FloatingActionButtons floatingActions={<PlatformHelpButton />} />
    </>
  );
};

export default HomePageLayout;
