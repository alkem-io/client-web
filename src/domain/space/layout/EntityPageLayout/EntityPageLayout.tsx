import { NotFoundErrorBoundary } from '@/core/notFound/NotFoundErrorBoundary';
import { Error404 } from '@/core/pages/Errors/Error404';
import FloatingActionButtons from '@/core/ui/button/FloatingActionButtons';
import { gutters } from '@/core/ui/grid/utils';
import PlatformHelpButton from '@/main/ui/helpButton/PlatformHelpButton';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import PageBannerWatermark from '@/main/ui/platformNavigation/PageBannerWatermark';
import { useScreenSize } from '@/core/ui/grid/constants';
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
  const { isLargeScreen } = useScreenSize();
  const [isTabsMenuOpen, setTabsMenuOpen] = useState(false);

  const tabs = Tabs ? (
    <Tabs currentTab={currentSection} mobile={!isLargeScreen} onMenuOpen={setTabsMenuOpen} />
  ) : (
    tabsElement &&
    cloneElement(tabsElement, { currentTab: currentSection, mobile: !isLargeScreen, onMenuOpen: setTabsMenuOpen })
  );

  const pageBannerWatermark = !isLargeScreen ? null : <PageBannerWatermark />;

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
            {...(!isLargeScreen ? { bottom: gutters(3) } : {})}
            visible={!isTabsMenuOpen}
            floatingActions={<PlatformHelpButton />}
          />
        }
        addWatermark={!isLargeScreen}
      >
        {isLargeScreen && tabs}
        {children}
        {!isLargeScreen && tabs}
      </TopLevelLayout>
    </NotFoundErrorBoundary>
  );
};

export default EntityPageLayout;
