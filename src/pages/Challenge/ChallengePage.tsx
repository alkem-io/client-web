import React, { FC } from 'react';
import ChallengePageContainer from '../../containers/challenge/ChallengePageContainer';
import { useUpdateNavigation } from '../../hooks';
import { ChallengeView } from '../../views/Challenge/ChallengeView';
import { PageProps } from '../common';

interface ChallengePageProps extends PageProps {}

const ChallengePage: FC<ChallengePageProps> = ({ paths }): React.ReactElement => {
  useUpdateNavigation({ currentPaths: paths });

  return (
    <ChallengePageContainer>
      {(entities, state) => {
        if (!entities || !state) return null;
        return <ChallengeView entities={entities} state={state} />;
      }}
    </ChallengePageContainer>
  );
};

export { ChallengePage as Challenge };
