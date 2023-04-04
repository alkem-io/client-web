import { EntityPageLayout, EntityPageLayoutProps } from '../../common/EntityPageLayout';
import OpportunityPageBanner from './OpportunityPageBanner';
import OpportunityTabs from './OpportunityTabs';
import React, { PropsWithChildren } from 'react';
import JourneyUnauthorizedDialogContainer from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialogContainer';
import JourneyUnauthorizedDialog from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialog';

interface OpportunityPageLayoutProps
  extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {}

const OpportunityPageLayout = (props: PropsWithChildren<OpportunityPageLayoutProps>) => {
  return (
    <>
      <EntityPageLayout
        {...props}
        pageBannerComponent={OpportunityPageBanner}
        tabsComponent={OpportunityTabs}
        entityTypeName="opportunity"
      />
      <JourneyUnauthorizedDialogContainer journeyTypeName="opportunity">
        {({ vision, ...props }) => (
          <JourneyUnauthorizedDialog journeyTypeName="opportunity" description={vision} {...props} />
        )}
      </JourneyUnauthorizedDialogContainer>
    </>
  );
};

export default OpportunityPageLayout;
