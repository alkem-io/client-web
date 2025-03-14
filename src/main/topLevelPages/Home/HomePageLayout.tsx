import { PropsWithChildren, useEffect, useState } from 'react';
import Footer from '@/main/ui/platformFooter/PlatformFooter';
import FloatingActionButtons from '@/core/ui/button/FloatingActionButtons';
import PlatformHelpButton from '@/main/ui/helpButton/PlatformHelpButton';
import PlatformNavigationBar from '@/main/ui/platformNavigation/PlatformNavigationBar';
import Breadcrumbs from '@/core/ui/navigation/Breadcrumbs';
import BreadcrumbsRootItem from '@/main/ui/breadcrumbs/BreadcrumbsRootItem';
import { useTranslation } from 'react-i18next';
import TopLevelPageBanner from '@/main/ui/layout/topLevelPageLayout/TopLevelPageBanner';
import { useUserContext } from '@/domain/community/user';
import SearchDialog from '@/main/search/SearchDialog';

const HomePageLayout = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(t('pages.home.sections.welcome.welcomeUnauthenticated'));
  const [subTitle, setSubTitle] = useState(t('pages.home.sections.welcome.welcomeUnauthenticatedSubtitle'));

  const { user: { user } = {}, isAuthenticated } = useUserContext();

  useEffect(() => {
    if (isAuthenticated) {
      setTitle(t('pages.home.sections.welcome.welcome-back', { username: user?.firstName }));
      setSubTitle(t('pages.home.subtitle'));
    }
  }, [isAuthenticated, user]);

  return (
    <>
      <PlatformNavigationBar
        breadcrumbs={
          <Breadcrumbs>
            <BreadcrumbsRootItem />
          </Breadcrumbs>
        }
      />
      <TopLevelPageBanner title={title} subtitle={subTitle} />
      {children}
      <Footer />
      <FloatingActionButtons floatingActions={<PlatformHelpButton />} />
      <SearchDialog />
    </>
  );
};

export default HomePageLayout;
