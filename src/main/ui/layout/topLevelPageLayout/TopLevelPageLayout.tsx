import React, { PropsWithChildren, ReactNode } from 'react';
import { PageBannerCardProps } from '../../../topLevelPages/pageBannerCard/PageBannerCard';
import TopLevelDesktopLayout from '../TopLevelDesktopLayout';
import PageContent from '../../../../core/ui/content/PageContent';
import TopLevelPageBreadcrumbs from '../../../topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import TopLevelPageBanner from './TopLevelPageBanner';
import { useLocation } from 'react-router-dom';

interface TopLevelPageLayoutProps extends PageBannerCardProps {
  ribbon?: ReactNode;
}

const TopLevelPageLayout = ({
  ribbon,
  children,
  iconComponent,
  title,
  ...props
}: PropsWithChildren<TopLevelPageLayoutProps>) => {
  const { pathname } = useLocation();

  const header = (
    <>
      <TopLevelPageBanner title={title} iconComponent={iconComponent} {...props} />
      {ribbon}
    </>
  );

  return (
    <TopLevelDesktopLayout
      header={header}
      breadcrumbs={
        <TopLevelPageBreadcrumbs iconComponent={iconComponent} uri={pathname}>
          {title}
        </TopLevelPageBreadcrumbs>
      }
    >
      <PageContent>{children}</PageContent>
    </TopLevelDesktopLayout>
  );
};

export default TopLevelPageLayout;
