import { EntityPageLayout, EntityPageLayoutProps } from '../../shared/layout/PageLayout';
import OrganizationPageBanner from './OrganizationPageBanner';
import { PropsWithChildren } from 'react';
import OrganizationTabs from './OrganizationTabs';

interface OrganizationPageLayoutProps
  extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {}

const OrganizationPageLayout = (props: PropsWithChildren<OrganizationPageLayoutProps>) => {
  return (
    <EntityPageLayout
      {...props}
      pageBannerComponent={OrganizationPageBanner}
      tabsComponent={OrganizationTabs}
      entityTypeName="organization"
    />
  );
};

export default OrganizationPageLayout;
