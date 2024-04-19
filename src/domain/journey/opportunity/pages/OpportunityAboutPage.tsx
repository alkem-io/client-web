import React, { FC } from 'react';
import AboutPageContainer from '../../common/AboutPageContainer/AboutPageContainer';
import { useOpportunity } from '../hooks/useOpportunity';
import { SubspacePageLayout } from '../../common/EntityPageLayout';
import OpportunityAboutView from '../../common/tabs/About/OpportunityAboutView';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

const OpportunityAboutPage: FC = () => {
  const { communityId } = useOpportunity();
  const { subSpaceId: challengeId, subSubSpaceId: opportunityId, journeyId, journeyPath } = useRouteResolver();

  return (
    <SubspacePageLayout journeyId={journeyId} journeyPath={journeyPath}>
      <AboutPageContainer journeyId={opportunityId}>
        {({ context, profile, tagset, permissions, ...rest }, state) => (
          <OpportunityAboutView
            challengeId={challengeId}
            opportunityId={opportunityId}
            opportunityUrl={profile?.url ?? ''}
            name={profile?.displayName ?? ''}
            tagline={profile?.tagline}
            tags={tagset?.tags}
            who={context?.who}
            impact={context?.impact}
            background={profile?.description}
            vision={context?.vision}
            communityReadAccess={permissions.communityReadAccess}
            communityId={communityId}
            {...rest}
            {...state}
          />
        )}
      </AboutPageContainer>
    </SubspacePageLayout>
  );
};

export default OpportunityAboutPage;
