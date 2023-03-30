import { JourneyPageLayout, EntityPageLayoutProps } from '../../common/JourneyPageLayout';
import OpportunityPageBanner from './OpportunityPageBanner';
import OpportunityTabs from './OpportunityTabs';
import { PropsWithChildren } from 'react';

interface OpportunityPageLayoutProps
  extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {}

const OpportunityPageLayout = (props: PropsWithChildren<OpportunityPageLayoutProps>) => {
  return (
    <JourneyPageLayout
      {...props}
      pageBannerComponent={OpportunityPageBanner}
      tabsComponent={OpportunityTabs}
      entityTypeName="opportunity"
    />
  );
};

export default OpportunityPageLayout;
