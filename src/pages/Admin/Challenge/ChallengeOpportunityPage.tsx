import React, { FC, useMemo } from 'react';
import { PageProps } from '../../common';
import { useUpdateNavigation } from '../../../hooks';
import {
  ChallengeContainerEntities,
  ChallengeContainerState,
} from '../../../containers/challenge/ChallengePageContainer';
import { ChallengeOpportunitiesView } from '../../../views/Challenge/ChallengeOpportunitiesView';

export interface ChallengeOpportunityPageProps extends PageProps {
  entities: ChallengeContainerEntities;
  state: ChallengeContainerState;
}

const ChallengeOpportunityPage: FC<ChallengeOpportunityPageProps> = ({ paths, entities, state }) => {
  const currentPaths = useMemo(
    () => [...paths, { value: '/opportunities', name: 'opportunities', real: false }],
    [paths]
  );
  useUpdateNavigation({ currentPaths });

  return <ChallengeOpportunitiesView entities={entities} state={state} />;
};
export default ChallengeOpportunityPage;
