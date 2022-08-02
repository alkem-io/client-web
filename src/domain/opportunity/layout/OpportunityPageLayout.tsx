import { EntityPageLayout, EntityPageLayoutProps } from '../../shared/layout/PageLayout';
import OpportunityPageBanner from './OpportunityPageBanner';
import OpportunityTabs from './OpportunityTabs';
import { PropsWithChildren } from 'react';

interface OpportunityPageLayoutProps extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent'> {}

const OpportunityPageLayout = (props: PropsWithChildren<OpportunityPageLayoutProps>) => {
  return <EntityPageLayout {...props} pageBannerComponent={OpportunityPageBanner} tabsComponent={OpportunityTabs} />;
};

export default OpportunityPageLayout;
