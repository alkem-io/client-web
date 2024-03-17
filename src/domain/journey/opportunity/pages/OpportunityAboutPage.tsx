import React, { FC } from 'react';
import AboutPageContainer from '../../common/AboutPageContainer/AboutPageContainer';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useOpportunity } from '../hooks/useOpportunity';
import OpportunityPageLayout from '../layout/OpportunityPageLayout';
import { OpportunityAboutView } from '../views/OpportunityAboutView';
import { useUrlParams } from '../../../../core/routing/useUrlParams';

const OpportunityAboutPage: FC = () => {
  const { spaceNameId, opportunityNameId } = useUrlParams();
  const { communityId } = useOpportunity();

  return (
    <OpportunityPageLayout currentSection={EntityPageSection.About}>
      <AboutPageContainer spaceNameId={spaceNameId ?? ''} opportunityNameId={opportunityNameId}>
        {({ context, profile, tagset, permissions, ...rest }, state) => (
          <OpportunityAboutView
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
