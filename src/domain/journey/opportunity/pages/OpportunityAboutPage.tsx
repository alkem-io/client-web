import React, { FC } from 'react';
import AboutPageContainer from '../../common/AboutPageContainer/AboutPageContainer';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useOpportunity } from '../hooks/useOpportunity';
import OpportunityPageLayout from '../layout/OpportunityPageLayout';
import OpportunityAboutView from '../../common/tabs/About/OpportunityAboutView';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

const OpportunityAboutPage: FC = () => {
  const { spaceNameId } = useUrlParams();
  const { communityId } = useOpportunity();

  const { challengeNameId } = useUrlParams();

  const { challengeId, opportunityId } = useRouteResolver();

  return (
    <OpportunityPageLayout currentSection={EntityPageSection.About}>
      <AboutPageContainer journeyId={opportunityId} journeyTypeName="opportunity">
        {({ context, profile, tagset, permissions, ...rest }, state) => (
          <OpportunityAboutView
            challengeId={challengeId}
            opportunityId={opportunityId}
            challengeNameId={challengeNameId}
            opportunityUrl={profile?.url ?? ''}
            name={profile?.displayName ?? ''}
            tagline={profile?.tagline}
            tags={tagset?.tags}
            who={context?.who}
            impact={context?.impact}
            background={profile?.description}
            vision={context?.vision}
            communityReadAccess={permissions.communityReadAccess}
            spaceNameId={spaceNameId}
            communityId={communityId}
            {...rest}
            {...state}
          />
        )}
      </AboutPageContainer>
    </OpportunityPageLayout>
  );
};

export default OpportunityAboutPage;
