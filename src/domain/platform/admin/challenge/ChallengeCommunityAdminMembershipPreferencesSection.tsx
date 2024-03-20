import React, { FC } from 'react';
import ChallengePreferenceContainer from '../../../journey/challenge/ChallengeSettingsContainer';
import ChallengeMembershipPreferenceView from '../../../journey/challenge/views/ChallengeMembershipPreferenceView';

interface Props {
  challengeId: string | undefined;
}

// TODO remove this "wrapper" component after migration from PreferenceContainer to a hook
// It's only here in order not to put a massive block in parent's rendered JSX
const ChallengeCommunityAdminMembershipPreferencesSection: FC<Props> = ({ challengeId }) => {
  return (
    <ChallengePreferenceContainer challengeId={challengeId}>
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
