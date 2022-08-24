import { EntityPageLayout, EntityPageLayoutProps } from '../../shared/layout/PageLayout';
import OpportunityPageBanner from './OpportunityPageBanner';
import OpportunityTabs from './OpportunityTabs';
import { PropsWithChildren } from 'react';

interface OpportunityPageLayoutProps
  extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {}

const OpportunityPageLayout = (props: PropsWithChildren<OpportunityPageLayoutProps>) => {
  return (
    <EntityPageLayout
      {...props}
      pageBannerComponent={OpportunityPageBanner}
      tabsComponent={OpportunityTabs}
      entityTypeName="opportunity"
    />
  );
};

export default OpportunityPageLayout;
