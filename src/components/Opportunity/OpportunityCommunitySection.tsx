import React, { FC, useCallback, useMemo } from 'react';
import { CommunityUpdatesDataContainer } from '../../containers/community-updates/CommunityUpdates';
import { useConfig } from '../../hooks';
import { OpportunityCommunityMessagesDocument, useOpportunityUserIdsQuery } from '../../hooks/generated/graphql';
import { FEATURE_COMMUNICATIONS } from '../../models/constants';
import {
  CommunicationMessageResult,
  OpportunityCommunityMessagesQuery,
  OpportunityCommunityMessagesQueryVariables,
  User,
} from '../../models/graphql-schema';
import CommunitySection, { CommunitySectionPropsExt } from '../../views/CommunitySection/CommunitySectionView';
import { Loading } from '../core';

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
    errorPolicy: 'all',
  });
  const { isFeatureEnabled } = useConfig();

  const addCommunityUpdatesContainer = useCallback(
    (children: (messages: CommunicationMessageResult[]) => React.ReactElement) => {
      if (isFeatureEnabled(FEATURE_COMMUNICATIONS)) {
        return (
          <CommunityUpdatesDataContainer<OpportunityCommunityMessagesQuery, OpportunityCommunityMessagesQueryVariables>
            entities={{
              document: OpportunityCommunityMessagesDocument,
              variables: {
                ecoverseId,
                opportunityId,
              },
              messageSelector: data => data?.ecoverse.opportunity.community?.updatesRoom?.messages || [],
              roomIdSelector: data => data?.ecoverse.opportunity.community?.updatesRoom?.id || '',
            }}
          >
            {({ messages }, { retrievingUpdateMessages }) =>
              retrievingUpdateMessages ? <Loading text={'Loading community data'} /> : children(messages)
            }
          </CommunityUpdatesDataContainer>
        );
      } else {
        return children([]);
      }
    },
    [isFeatureEnabled]
  );

  const memoizedNode = useMemo(
    () =>
      addCommunityUpdatesContainer(messages => (
        <CommunitySection
          users={(usersQuery?.ecoverse.opportunity.community?.members as User[]) || []}
          updates={messages}
          discussions={[]}
          {...rest}
        />
      )),
    [addCommunityUpdatesContainer]
  );

  if (usersLoading) return <Loading text={'Loading community data'} />;

  return memoizedNode;
};
export default OpportunityCommunitySection;
