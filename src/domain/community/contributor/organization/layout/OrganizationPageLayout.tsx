import { EntityPageLayout, EntityPageLayoutProps } from '../../../../journey/common/EntityPageLayout';
import OrganizationPageBanner from './OrganizationPageBanner';
import { PropsWithChildren } from 'react';
import OrganizationTabs from './OrganizationTabs';

interface OrganizationPageLayoutProps
  extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {}

const OrganizationPageLayout = (props: PropsWithChildren<OrganizationPageLayoutProps>) => {
  return <EntityPageLayout {...props} pageBannerComponent={OrganizationPageBanner} tabsComponent={OrganizationTabs} />;
};

export default OrganizationPageLayout;
