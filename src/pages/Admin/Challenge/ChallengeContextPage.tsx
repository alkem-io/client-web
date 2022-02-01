import React, { FC, useMemo } from 'react';
import { PageProps } from '../../common';
import { useUpdateNavigation } from '../../../hooks';
import { ChallengeContextView } from '../../../views/Challenge/ChallengeContextView';
import {
  ChallengeContainerEntities,
  ChallengeContainerState,
} from '../../../containers/challenge/ChallengePageContainer';

export interface ChallengeContextPageProps extends PageProps {
  entities: ChallengeContainerEntities;
  state: ChallengeContainerState;
}

const ChallengeContextPage: FC<ChallengeContextPageProps> = ({ paths, entities, state }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/context', name: 'context', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return <ChallengeContextView entities={entities} state={state} />;
};
export default ChallengeContextPage;
