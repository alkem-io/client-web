import React, { FC, useMemo } from 'react';
import { PageProps } from '../../common';
import { useChallenge, useHub, useUpdateNavigation } from '../../../hooks';
import { ChallengeContextView } from '../../../views/Challenge/ChallengeContextView';
import ContextTabContainer from '../../../containers/context/ContextTabContainer';
import { AuthorizationPrivilege } from '../../../models/graphql-schema';

export interface ChallengeContextPageProps extends PageProps {}

const ChallengeContextPage: FC<ChallengeContextPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/context', name: 'context', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const { displayName: hubDisplayName } = useHub();
  const {
    hubId,
    hubNameId,
    displayName: challengeDisplayName,
    challengeId,
    challengeNameId,
    permissions: { contextPrivileges },
  } = useChallenge();
  const loadAspectsAndReferences = contextPrivileges.includes(AuthorizationPrivilege.Read);

  return (
    <ContextTabContainer
      hubNameId={hubNameId}
      challengeNameId={challengeNameId}
      loadAspectsAndReferences={loadAspectsAndReferences}
    >
      {(entities, state) => (
        <ChallengeContextView
          entities={{
            hubId: hubId,
            hubNameId: hubNameId,
            hubDisplayName: hubDisplayName,
            challengeId,
            challengeNameId,
            challengeDisplayName,
            challengeTagset: entities.tagset,
            challengeLifecycle: entities.lifecycle,
            context: entities.context,
            aspects: entities?.aspects,
            references: entities?.references,
          }}
          state={{
            loading: state.loading,
            error: state.error,
          }}
          options={{
            canReadAspects: entities.permissions.canReadAspects,
            canCreateAspects: entities.permissions.canCreateAspects,
            canCreateCommunityContextReview: entities.permissions.canCreateCommunityContextReview,
          }}
          actions={{}}
        />
      )}
    </ContextTabContainer>
  );
};
export default ChallengeContextPage;
