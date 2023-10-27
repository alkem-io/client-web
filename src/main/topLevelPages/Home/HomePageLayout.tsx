import React, { PropsWithChildren } from 'react';
import Footer from '../../ui/platformFooter/PlatformFooter';
import FloatingActionButtons from '../../../core/ui/button/FloatingActionButtons';
import PlatformHelpButton from '../../ui/helpButton/PlatformHelpButton';
import PlatformNavigationBar from '../../ui/platformNavigation/PlatformNavigationBar';
import Breadcrumbs from '../../../core/ui/navigation/Breadcrumbs';
import BreadcrumbsRootItem from '../../ui/breadcrumbs/BreadcrumbsRootItem';
import { useTranslation } from 'react-i18next';
import TopLevelPageBanner from '../../ui/layout/topLevelPageLayout/TopLevelPageBanner';
import { useUserContext } from '../../../domain/community/user';

const HomePageLayout = ({ children }: PropsWithChildren<{}>) => {
  const { t } = useTranslation();

  const { user: { user } = {} } = useUserContext();

  const title = t('pages.home.sections.welcome.welcome-back', {
    username: user?.firstName,
  });

  return (
    <>
      <PlatformNavigationBar
        breadcrumbs={
          <Breadcrumbs>
            <BreadcrumbsRootItem />
          </Breadcrumbs>
        }
      />
      <TopLevelPageBanner title={title} subtitle={t('pages.home.subtitle')} />
      {children}
      <Footer />
      <FloatingActionButtons floatingActions={<PlatformHelpButton />} />
    </>
  );
};

export default HomePageLayout;
