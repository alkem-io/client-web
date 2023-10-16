import { EntityPageLayout } from '../../common/EntityPageLayout';
import OpportunityPageBanner from './OpportunityPageBanner';
import OpportunityTabs from './OpportunityTabs';
import React, { PropsWithChildren } from 'react';
import JourneyUnauthorizedDialogContainer from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialogContainer';
import JourneyUnauthorizedDialog from '../../common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialog';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import JourneyBreadcrumbs from '../../common/journeyBreadcrumbs/JourneyBreadcrumbs';

interface OpportunityPageLayoutProps {
  currentSection: EntityPageSection;
}

const OpportunityPageLayout = ({ currentSection, children }: PropsWithChildren<OpportunityPageLayoutProps>) => {
  return (
    <EntityPageLayout
      currentSection={currentSection}
      breadcrumbs={<JourneyBreadcrumbs />}
      pageBannerComponent={OpportunityPageBanner}
      tabsComponent={OpportunityTabs}
    >
      {children}
      <JourneyUnauthorizedDialogContainer journeyTypeName="opportunity">
        {({ vision, ...props }) => (
          <JourneyUnauthorizedDialog journeyTypeName="opportunity" description={vision} {...props} />
        )}
      </JourneyUnauthorizedDialogContainer>
    </EntityPageLayout>
  );
};

export default OpportunityPageLayout;
