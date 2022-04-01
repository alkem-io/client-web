import React, { FC, useMemo } from 'react';
import { PageProps } from '../../common';
import { useChallenge, useUpdateNavigation } from '../../../hooks';
import ChallengePreferenceContainer from '../../../containers/preferences/challenge/ChallengePreferenceContainer';
import ChallengeMembershipPreferenceView from '../../../views/Challenge/ChallengeMembershipPreferenceView';

const ChallengeMembershipPreferencePage: FC<PageProps> = ({ paths }) => {
  const { hubId, challengeId } = useChallenge();
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'preferences', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <ChallengePreferenceContainer hubId={hubId} challengeId={challengeId}>
      {(entities, state, actions) => {
        const authPrefs = entities.preferences.filter(x => x.definition.group === 'MembershipChallenge');
        return (
          <ChallengeMembershipPreferenceView
            entities={{ preferences: authPrefs }}
            state={{ loading: state.loading, error: state.error }}
            actions={{ onUpdate: actions.onUpdate }}
            options={{}}
          />
        );
      }}
    </ChallengePreferenceContainer>
  );
};
export default ChallengeMembershipPreferencePage;
