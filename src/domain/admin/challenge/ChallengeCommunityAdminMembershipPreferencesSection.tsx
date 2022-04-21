import React, { FC } from 'react';
import ChallengePreferenceContainer from '../../../containers/preferences/challenge/ChallengePreferenceContainer';
import ChallengeMembershipPreferenceView from '../../../views/Challenge/ChallengeMembershipPreferenceView';

interface Props {
  hubId: string;
  challengeId: string;
}

// TODO remove this "wrapper" component after migration from PreferenceContainer to a hook
// It's only here in order not to put a massive block in parent's rendered JSX
const ChallengeCommunityAdminMembershipPreferencesSection: FC<Props> = ({ hubId, challengeId }) => {
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

export default ChallengeCommunityAdminMembershipPreferencesSection;
