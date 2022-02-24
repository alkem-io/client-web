import React, { FC, useMemo } from 'react';
import { PageProps } from '../../common';
import { useUpdateNavigation } from '../../../hooks';
import ChallengePageContainer from '../../../containers/challenge/ChallengePageContainer';
import { ChallengeOpportunitiesView } from '../../../views/Challenge/ChallengeOpportunitiesView';

export interface ChallengeOpportunityPageProps extends PageProps {}

const ChallengeOpportunityPage: FC<ChallengeOpportunityPageProps> = ({ paths }) => {
  const currentPaths = useMemo(
    () => [...paths, { value: '/opportunities', name: 'opportunities', real: false }],
    [paths]
  );
  useUpdateNavigation({ currentPaths });

  return (
    <ChallengePageContainer>
      {(entities, state) => <ChallengeOpportunitiesView entities={entities} state={state} />}
    </ChallengePageContainer>
  );
};
export default ChallengeOpportunityPage;
