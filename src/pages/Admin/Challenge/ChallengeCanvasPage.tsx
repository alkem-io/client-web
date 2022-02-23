import React, { FC, useMemo } from 'react';
import { PageProps } from '../../common';
import { useUpdateNavigation } from '../../../hooks';
import ChallengePageContainer from '../../../containers/challenge/ChallengePageContainer';
import ChallengeCanvasManagementView from '../../../views/Challenge/ChallengeCanvasManagementView';

export interface ChallengeCanvasPageProps extends PageProps {}

const ChallengeCanvasPage: FC<ChallengeCanvasPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/canvases', name: 'canvases', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <ChallengePageContainer>
      {(entities, state) => {
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
      }}
    </ChallengePageContainer>
  );
};
export default ChallengeCanvasPage;
