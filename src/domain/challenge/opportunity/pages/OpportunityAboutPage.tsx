import React, { FC } from 'react';
import AboutPageContainer from '../../common/AboutPageContainer/AboutPageContainer';
import { PageProps } from '../../../shared/types/PageProps';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useOpportunity } from '../hooks/useOpportunity';
import OpportunityPageLayout from '../layout/OpportunityPageLayout';
import { OpportunityAboutView } from '../views/OpportunityAboutView';

export interface OpportunityAboutPageProps extends PageProps {}

const OpportunityAboutPage: FC<OpportunityAboutPageProps> = () => {
  const { hubNameId, opportunityNameId, displayName } = useOpportunity();

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
            {...rest}
            {...state}
          />
        )}
      </AboutPageContainer>
    </OpportunityPageLayout>
  );
};
export default OpportunityAboutPage;
