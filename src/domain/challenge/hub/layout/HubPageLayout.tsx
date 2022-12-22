import { EntityPageLayout, EntityPageLayoutProps } from '../../common/EntityPageLayout';
import HubPageBanner from './HubPageBanner';
import HubTabs from './HubTabs';
import { PropsWithChildren } from 'react';

export interface HubPageLayoutProps
  extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {}

const HubPageLayout = (props: PropsWithChildren<HubPageLayoutProps>) => {
  return (
    <EntityPageLayout {...props} pageBannerComponent={HubPageBanner} tabsComponent={HubTabs} entityTypeName="hub" />
  );
};

export default HubPageLayout;
