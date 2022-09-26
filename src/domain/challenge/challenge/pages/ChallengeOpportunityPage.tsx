import React, { FC, useMemo } from 'react';
import { useUpdateNavigation } from '../../../../hooks';
import ChallengePageContainer from '../../../../containers/challenge/ChallengePageContainer';
import ChallengePageLayout from '../layout/ChallengePageLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { ChallengeOpportunitiesView } from '../views/ChallengeOpportunitiesView';
import { PageProps } from '../../../../pages/common';

export interface ChallengeOpportunityPageProps extends PageProps {}

const ChallengeOpportunityPage: FC<ChallengeOpportunityPageProps> = ({ paths }) => {
  const currentPaths = useMemo(
    () => [...paths, { value: '/opportunities', name: 'opportunities', real: false }],
    [paths]
  );
  useUpdateNavigation({ currentPaths });

  return (
    <ChallengePageLayout currentSection={EntityPageSection.Opportunities}>
      <ChallengePageContainer>
        {(entities, state) => <ChallengeOpportunitiesView entities={entities} state={state} />}
      </ChallengePageContainer>
    </ChallengePageLayout>
  );
};

export default ChallengeOpportunityPage;
