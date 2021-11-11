import React, { FC, useCallback, useMemo } from 'react';
import {
  CommunityUpdatesDataContainer,
  CommunityUpdatesDataEntities,
} from '../../../../containers/community-updates/CommunityUpdates';
import { useConfig } from '../../../../hooks';
import { OpportunityCommunityMessagesDocument, useOpportunityUserIdsQuery } from '../../../../hooks/generated/graphql';
import { FEATURE_COMMUNICATIONS } from '../../../../models/constants';
import {
  OpportunityCommunityMessagesQuery,
  OpportunityCommunityMessagesQueryVariables,
  User,
} from '../../../../models/graphql-schema';
import CommunitySection, { CommunitySectionPropsExt } from '../../../../views/CommunitySection/CommunitySectionView';
import { Loading } from '../../../core';

interface OpportunityCommunitySectionProps extends CommunitySectionPropsExt {
  ecoverseId: string;
  opportunityId: string;
}

export const OpportunityCommunitySection: FC<OpportunityCommunitySectionProps> = ({
  ecoverseId,
  opportunityId,
  ...rest
}) => {
  const { data: usersQuery, loading: usersLoading } = useOpportunityUserIdsQuery({
    variables: {
      ecoverseId,
      opportunityId,
    },
    skip: !ecoverseId || !opportunityId,
    errorPolicy: 'all',
  });
  const { isFeatureEnabled } = useConfig();

  const addCommunityUpdatesContainer = useCallback(
    (children: (entities?: CommunityUpdatesDataEntities) => React.ReactElement) => {
      if (isFeatureEnabled(FEATURE_COMMUNICATIONS) && ecoverseId && opportunityId) {
        return (
          <CommunityUpdatesDataContainer<OpportunityCommunityMessagesQuery, OpportunityCommunityMessagesQueryVariables>
            entities={{
              document: OpportunityCommunityMessagesDocument,
              variables: {
                ecoverseId,
                opportunityId,
              },
              messageSelector: data => data?.ecoverse.opportunity.community?.communication?.updates?.messages || [],
              roomIdSelector: data => data?.ecoverse.opportunity.community?.communication?.updates?.id || '',
            }}
          >
            {(entities, { retrievingUpdateMessages }) =>
              retrievingUpdateMessages ? <Loading text={'Loading community data'} /> : children(entities)
            }
          </CommunityUpdatesDataContainer>
        );
      } else {
        return children(undefined);
      }
    },
    [isFeatureEnabled, ecoverseId, opportunityId]
  );

  const memoizedNode = useMemo(
    () =>
      addCommunityUpdatesContainer(entities => (
        <CommunitySection
          users={(usersQuery?.ecoverse.opportunity.community?.members as User[]) || []}
          updates={entities?.messages}
          updateSenders={entities?.senders}
          discussions={[]}
          parentEntityId={opportunityId}
          {...rest}
        />
      )),
    [addCommunityUpdatesContainer, usersQuery]
  );

  if (usersLoading) return <Loading text={'Loading community data'} />;

  return memoizedNode;
};
export default OpportunityCommunitySection;
