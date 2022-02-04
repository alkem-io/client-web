import React, { FC, useMemo } from 'react';
import { PageProps } from '../../common';
import { useChallenge, useEcoverse, useUpdateNavigation } from '../../../hooks';
import { ChallengeContextView } from '../../../views/Challenge/ChallengeContextView';
import ContextTabContainer from '../../../containers/context/ContextTabContainer';

export interface ChallengeContextPageProps extends PageProps {}

const ChallengeContextPage: FC<ChallengeContextPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/context', name: 'context', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const { displayName: hubDisplayName } = useEcoverse();
  const {
    ecoverseId,
    ecoverseNameId,
    displayName: challengeDisplayName,
    challengeId,
    challengeNameId,
  } = useChallenge();

  return (
    <ContextTabContainer hubNameId={ecoverseNameId} challengeNameId={challengeNameId}>
      {(entities, state) => (
        <ChallengeContextView
          entities={{
            hubId: ecoverseId,
            hubNameId: ecoverseNameId,
            hubDisplayName: hubDisplayName,
            challengeId,
            challengeNameId,
            challengeDisplayName,
            challengeTagset: entities.tagset,
            challengeLifecycle: entities.lifecycle,
            context: entities.context,
          }}
          state={{
            loading: state.loading,
            error: state.error,
          }}
          options={{
            canReadAspects: entities.permissions.canReadAspects,
            canCreateAspects: entities.permissions.canCreateAspects,
          }}
          actions={{}}
        />
      )}
    </ContextTabContainer>
  );
};
export default ChallengeContextPage;
