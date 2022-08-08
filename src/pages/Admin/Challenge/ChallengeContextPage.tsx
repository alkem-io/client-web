import React, { FC, useMemo } from 'react';
import { PageProps } from '../../common';
import { useChallenge, useHub, useUpdateNavigation } from '../../../hooks';
import { ChallengeContextView } from '../../../views/Challenge/ChallengeContextView';
import ContextTabContainer from '../../../containers/context/ContextTabContainer';
import { AuthorizationPrivilege } from '../../../models/graphql-schema';
import ChallengePageLayout from '../../../domain/challenge/layout/ChallengePageLayout';
import { EntityPageSection } from '../../../domain/shared/layout/EntityPageSection';

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
    <ChallengePageLayout currentSection={EntityPageSection.About}>
      <ContextTabContainer
        hubNameId={hubNameId}
        challengeNameId={challengeNameId}
        loadReferences={loadAspectsAndReferences}
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
              references: entities.references,
            }}
            state={{
              loading: state.loading,
              error: state.error,
            }}
            options={{
              canCreateCommunityContextReview: entities.permissions.canCreateCommunityContextReview,
            }}
            actions={{}}
            communityReadAccess={entities.permissions.communityReadAccess}
            community={entities.contributors}
            activity={entities.activity}
          />
        )}
      </ContextTabContainer>
    </ChallengePageLayout>
  );
};
export default ChallengeContextPage;
