import React, { FC } from 'react';
import ChallengeSettingsContainer from '../../../journey/challenge/ChallengeSettingsContainer';
import ChallengeMembershipSettingsView from '../../../journey/challenge/views/ChallengeMembershipSettingsView';

interface Props {
  challengeId: string | undefined;
}

// TODO remove this "wrapper" component after migration from PreferenceContainer to a hook
// It's only here in order not to put a massive block in parent's rendered JSX
const ChallengeCommunityAdminMembershipSettingsSection: FC<Props> = ({ challengeId }) => {
  return (
    <ChallengeSettingsContainer challengeId={challengeId}>
      {(entities, state, actions) => {
        return (
          <ChallengeMembershipSettingsView
            entities={{ settings: entities.settings }}
            state={{ loading: state.loading, error: state.error }}
            actions={{ loading: actions.onUpdate }} // TODO
            options={{ loading: actions.onUpdate }}
          />
        );
      }}
    </ChallengeSettingsContainer>
  );
};

export default ChallengeCommunityAdminMembershipSettingsSection;
