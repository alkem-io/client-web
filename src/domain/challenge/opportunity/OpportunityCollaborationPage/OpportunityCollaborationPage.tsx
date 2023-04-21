import React from 'react';
import CalloutPage from '../../../collaboration/CalloutPage/CalloutPage';
import ContributePage from '../../../collaboration/contribute/ContributePage';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { buildOpportunityUrl } from '../../../../common/utils/urlBuilders';

const OpportunityCollaborationPage = () => {
  const { hubNameId, challengeNameId, opportunityNameId } = useUrlParams();

  if (!hubNameId || !challengeNameId || !opportunityNameId) {
    throw new Error('Must be within an Opportunity');
  }

  const getPageRoute = (calloutGroup: string | undefined) => {
    switch (calloutGroup) {
      default:
        return `${buildOpportunityUrl(hubNameId, challengeNameId, opportunityNameId)}/${EntityPageSection.Contribute}`;
    }
  };

  return (
    <CalloutPage journeyTypeName="opportunity" parentRoute={getPageRoute}>
      {calloutGroup => {
        switch (calloutGroup) {
          // Add handling for groups here
          default:
            return <ContributePage journeyTypeName="hub" />;
        }
      }}
    </CalloutPage>
  );
};

export default OpportunityCollaborationPage;
