import { EntityPageLayout, EntityPageLayoutProps, NotFoundPageLayout } from '../../common/EntityPageLayout';
import OpportunityPageBanner from './OpportunityPageBanner';
import OpportunityTabs from './OpportunityTabs';
import React, { PropsWithChildren } from 'react';
import JourneyUnauthorizedDialogContainer from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialogContainer';
import JourneyUnauthorizedDialog from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialog';
import { NotFoundErrorBoundary } from '../../../../core/notfound/NotFoundErrorBoundary';
import { Error404 } from '../../../../core/pages/Errors/Error404';

interface OpportunityPageLayoutProps
  extends Omit<EntityPageLayoutProps, 'pageBannerComponent' | 'tabsComponent' | 'entityTypeName'> {}

const OpportunityPageLayout = (props: PropsWithChildren<OpportunityPageLayoutProps>) => {
  return (
    <NotFoundErrorBoundary
      errorComponent={
        <NotFoundPageLayout>
          <Error404 />
        </NotFoundPageLayout>
      }
    >
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
    </NotFoundErrorBoundary>
  );
};

export default OpportunityPageLayout;
