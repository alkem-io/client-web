import React, { FC } from 'react';
import ChallengePreferenceContainer from '../../../common/preference/challenge/ChallengePreferenceContainer';
import ChallengeMembershipPreferenceView from '../../../challenge/challenge/views/ChallengeMembershipPreferenceView';

interface Props {
  spaceId: string;
  challengeId: string;
}

// TODO remove this "wrapper" component after migration from PreferenceContainer to a hook
// It's only here in order not to put a massive block in parent's rendered JSX
const ChallengeCommunityAdminMembershipPreferencesSection: FC<Props> = ({ spaceId, challengeId }) => {
  return (
    <ChallengePreferenceContainer spaceId={spaceId} challengeId={challengeId}>
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
