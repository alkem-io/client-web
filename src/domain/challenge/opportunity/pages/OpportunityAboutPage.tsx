import React, { FC } from 'react';
import AboutPageContainer from '../../common/AboutPageContainer/AboutPageContainer';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useOpportunity } from '../hooks/useOpportunity';
import OpportunityPageLayout from '../layout/OpportunityPageLayout';
import { OpportunityAboutView } from '../views/OpportunityAboutView';

const OpportunityAboutPage: FC = () => {
  const { hubNameId, opportunityNameId, displayName, communityId } = useOpportunity();

  return (
    <OpportunityPageLayout currentSection={EntityPageSection.About}>
      <AboutPageContainer hubNameId={hubNameId} opportunityNameId={opportunityNameId}>
        {({ context, tagset, permissions, ...rest }, state) => (
          <OpportunityAboutView
            name={displayName}
            tagline={context?.tagline}
            tags={tagset?.tags}
            who={context?.who}
            impact={context?.impact}
            background={context?.background}
            vision={context?.vision}
            communityReadAccess={permissions.communityReadAccess}
            hubNameId={hubNameId}
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
