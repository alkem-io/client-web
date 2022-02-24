import React, { FC, useMemo } from 'react';
import { useHub, useUpdateNavigation } from '../../hooks';
import { PageProps } from '../common';
import HubChallengesView from '../../views/Hub/HubChallengesView';
import ChallengesCardContainer from '../../containers/hub/ChallengesCardContainer';

export interface HubChallengesPageProps extends PageProps {}

const HubChallengesPage: FC<HubChallengesPageProps> = ({ paths }) => {
  const { hubNameId, permissions } = useHub();
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'challenges', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <ChallengesCardContainer hubNameId={hubNameId}>
      {(entities, state) => (
        <HubChallengesView
          entities={{
            challenges: entities.challenges,
            hubNameId: hubNameId,
            permissions: {
              canReadChallenges: permissions.canReadChallenges,
            },
          }}
          state={{ loading: state.loading, error: state.error }}
          actions={{}}
          options={{}}
        />
      )}
    </ChallengesCardContainer>
  );
};
export default HubChallengesPage;
