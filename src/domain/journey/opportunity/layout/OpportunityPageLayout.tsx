import { EntityPageLayout } from '../../common/EntityPageLayout';
import ChildJourneyPageBanner from '../../common/childJourneyPageBanner/ChildJourneyPageBanner';
import React, { PropsWithChildren } from 'react';
import JourneyUnauthorizedDialogContainer from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialogContainer';
import JourneyUnauthorizedDialog from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialog';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import JourneyBreadcrumbs from '../../common/journeyBreadcrumbs/JourneyBreadcrumbs';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

interface OpportunityPageLayoutProps {
  currentSection: EntityPageSection;
}

/**
 * @deprecated
 */
const OpportunityPageLayout = ({ currentSection, children }: PropsWithChildren<OpportunityPageLayoutProps>) => {
  const { subSubSpaceId: opportunityId, loading } = useRouteResolver();

  return (
    <EntityPageLayout
      currentSection={currentSection}
      breadcrumbs={<JourneyBreadcrumbs />}
      pageBannerComponent={ChildJourneyPageBanner}
    >
      {children}
      <JourneyUnauthorizedDialogContainer journeyId={opportunityId} loading={loading}>
        {({ vision, ...props }) => <JourneyUnauthorizedDialog description={vision} {...props} />}
      </JourneyUnauthorizedDialogContainer>
    </EntityPageLayout>
  );
};

export default OpportunityPageLayout;
