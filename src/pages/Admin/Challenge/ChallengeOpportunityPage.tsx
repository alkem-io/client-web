import React, { FC, useMemo } from 'react';
import { PageProps } from '../../common';
import { useUpdateNavigation } from '../../../hooks';
import ChallengePageContainer from '../../../containers/challenge/ChallengePageContainer';
import { ChallengeOpportunitiesView } from '../../../views/Challenge/ChallengeOpportunitiesView';
import ChallengePageLayout from '../../../domain/challenge/layout/ChallengePageLayout';
import { EntityPageSection } from '../../../domain/shared/layout/EntityPageSection';

export interface ChallengeOpportunityPageProps extends PageProps {}

const ChallengeOpportunityPage: FC<ChallengeOpportunityPageProps> = ({ paths }) => {
  const currentPaths = useMemo(
    () => [...paths, { value: '/opportunities', name: 'opportunities', real: false }],
    [paths]
  );
  useUpdateNavigation({ currentPaths });

  return (
    <ChallengePageLayout currentSection={EntityPageSection.Opportunities} entityTypeName="challenge">
      <ChallengePageContainer>
        {(entities, state) => <ChallengeOpportunitiesView entities={entities} state={state} />}
      </ChallengePageContainer>
    </ChallengePageLayout>
  );
};

export default ChallengeOpportunityPage;
