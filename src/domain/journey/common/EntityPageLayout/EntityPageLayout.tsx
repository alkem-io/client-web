import { NotFoundErrorBoundary } from '@/core/notFound/NotFoundErrorBoundary';
import { Error404 } from '@/core/pages/Errors/Error404';
import FloatingActionButtons from '@/core/ui/button/FloatingActionButtons';
import { gutters } from '@/core/ui/grid/utils';
import PlatformHelpButton from '@/main/ui/helpButton/PlatformHelpButton';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import PageBannerWatermark from '@/main/ui/platformNavigation/PageBannerWatermark';
import { Theme, useMediaQuery } from '@mui/material';
import { cloneElement, useState } from 'react';
import { EntityPageLayoutProps } from './EntityPageLayoutTypes';

const EntityPageLayout = ({
  currentSection,
  breadcrumbs,
  pageBannerComponent: PageBanner,
  pageBanner: pageBannerElement,
  tabsComponent: Tabs,
  tabs: tabsElement,
  children,
}: EntityPageLayoutProps) => {
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('lg'));
  const [isTabsMenuOpen, setTabsMenuOpen] = useState(false);

  const tabs = Tabs ? (
    <Tabs currentTab={currentSection} mobile={isMobile} onMenuOpen={setTabsMenuOpen} />
  ) : (
    tabsElement &&
    cloneElement(tabsElement, { currentTab: currentSection, mobile: isMobile, onMenuOpen: setTabsMenuOpen })
  );

  const pageBannerWatermark = isMobile ? null : <PageBannerWatermark />;

  const pageBanner = PageBanner ? (
    <PageBanner watermark={pageBannerWatermark} />
  ) : (
    pageBannerElement && cloneElement(pageBannerElement, { watermark: pageBannerWatermark })
  );

  return (
    <NotFoundErrorBoundary
      errorComponent={
        <TopLevelLayout>
          <Error404 />
        </TopLevelLayout>
      }
    >
      <TopLevelLayout
        breadcrumbs={breadcrumbs}
        header={PageBanner ? <PageBanner watermark={pageBannerWatermark} /> : pageBanner}
        floatingActions={
          <FloatingActionButtons
            {...(isMobile ? { bottom: gutters(3) } : {})}
            visible={!isTabsMenuOpen}
            floatingActions={<PlatformHelpButton />}
          />
        }
        addWatermark={isMobile}
      >
        {!isMobile && tabs}
        {children}
        {isMobile && tabs}
      </TopLevelLayout>
    </NotFoundErrorBoundary>
  );
};

export default EntityPageLayout;
