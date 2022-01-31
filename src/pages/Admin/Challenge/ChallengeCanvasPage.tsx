import React, { FC, useMemo } from 'react';
import { PageProps } from '../../common';
import { useUpdateNavigation } from '../../../hooks';
import {
  ChallengeContainerEntities,
  ChallengeContainerState,
} from '../../../containers/challenge/ChallengePageContainer';
import ChallengeCanvasManagementView from '../../../views/Challenge/ChallengeCanvasManagementView';

export interface ChallengeCanvasPageProps extends PageProps {
  entities: ChallengeContainerEntities;
  state: ChallengeContainerState;
}

const ChallengeCanvasPage: FC<ChallengeCanvasPageProps> = ({ paths, entities, state }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/canvases', name: 'canvases', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  if (!entities.challenge) {
    return <></>;
  }

  return (
    <ChallengeCanvasManagementView
      entities={{ challenge: entities.challenge }}
      state={{ loading: state.loading, error: state.error }}
      actions={undefined}
      options={undefined}
    />
  );
};
export default ChallengeCanvasPage;
