import { EntityPageLayout } from '../../common/EntityPageLayout';
import OpportunityPageBanner from './OpportunityPageBanner';
import OpportunityTabs from './OpportunityTabs';
import React, { PropsWithChildren } from 'react';
import JourneyUnauthorizedDialogContainer from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialogContainer';
import JourneyUnauthorizedDialog from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialog';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import JourneyBreadcrumbs from '../../common/journeyBreadcrumbs/JourneyBreadcrumbs';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

interface OpportunityPageLayoutProps {
  currentSection: EntityPageSection;
}

const OpportunityPageLayout = ({ currentSection, children }: PropsWithChildren<OpportunityPageLayoutProps>) => {
  const { subSubSpaceId: opportunityId, loading } = useRouteResolver();

  return (
    <EntityPageLayout
      currentSection={currentSection}
      breadcrumbs={<JourneyBreadcrumbs />}
      pageBannerComponent={OpportunityPageBanner}
      tabsComponent={OpportunityTabs}
    >
      {children}
      <JourneyUnauthorizedDialogContainer journeyId={opportunityId} journeyTypeName="subsubspace" loading={loading}>
        {({ vision, ...props }) => (
          <JourneyUnauthorizedDialog journeyTypeName="subsubspace" description={vision} {...props} />
        )}
      </JourneyUnauthorizedDialogContainer>
    </EntityPageLayout>
  );
};

export default OpportunityPageLayout;
