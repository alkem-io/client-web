import { EntityPageLayout, EntityPageLayoutProps } from '../../shared/layout/PageLayout';
import HubPageBanner from './HubPageBanner';
import HubTabs from './HubTabs';
import { PropsWithChildren } from 'react';

interface HubPageLayoutProps extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent'> {}

const HubPageLayout = (props: PropsWithChildren<HubPageLayoutProps>) => {
  return <EntityPageLayout {...props} pageBannerComponent={HubPageBanner} tabsComponent={HubTabs} />;
};

export default HubPageLayout;
