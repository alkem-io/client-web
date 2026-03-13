import { type PropsWithChildren, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import FloatingActionButtons from '@/core/ui/button/FloatingActionButtons';
import Breadcrumbs from '@/core/ui/navigation/Breadcrumbs';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import SearchDialog from '@/main/search/SearchDialog';
import BreadcrumbsRootItem from '@/main/ui/breadcrumbs/BreadcrumbsRootItem';
import PlatformHelpButton from '@/main/ui/helpButton/PlatformHelpButton';
import TopLevelPageBanner from '@/main/ui/layout/topLevelPageLayout/TopLevelPageBanner';
import Footer from '@/main/ui/platformFooter/PlatformFooter';
import PlatformNavigationBar from '@/main/ui/platformNavigation/PlatformNavigationBar';

const HomePageLayout = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [title, setTitle] = useState(t('pages.home.sections.welcome.welcomeUnauthenticated'));
  const [subTitle, setSubTitle] = useState(t('pages.home.sections.welcome.welcomeUnauthenticatedSubtitle'));

  const { userModel, isAuthenticated } = useCurrentUserContext();

  useEffect(() => {
    if (isAuthenticated) {
      setTitle(t('pages.home.sections.welcome.welcome-back', { username: userModel?.firstName }));
      setSubTitle(t('pages.home.subtitle'));
    }
  }, [isAuthenticated, userModel]);

  const isHomePage = location.pathname === '/home';

  return (
    <>
      <PlatformNavigationBar
        breadcrumbs={
          <Breadcrumbs>
            <BreadcrumbsRootItem size={isHomePage ? 'large' : undefined} />
          </Breadcrumbs>
        }
        staticPosition={isHomePage}
      />
      {!isHomePage && <TopLevelPageBanner title={title} subtitle={subTitle} />}
      {children}
      <Footer />
      <FloatingActionButtons floatingActions={<PlatformHelpButton />} />
      <SearchDialog />
    </>
  );
};

export default HomePageLayout;
