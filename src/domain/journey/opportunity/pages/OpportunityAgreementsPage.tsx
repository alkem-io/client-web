import React from 'react';
import OpportunityPageLayout from '../layout/OpportunityPageLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import OpportunityProjectsView from '../views/OpportunityProjectsView';

const OpportunityAgreementsPage = () => {
  return (
    <OpportunityPageLayout currentSection={EntityPageSection.Agreements}>
      <OpportunityProjectsView />
    </OpportunityPageLayout>
  );
};

export default OpportunityAgreementsPage;
