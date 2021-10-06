import React, { FC, useCallback, useMemo } from 'react';
import { CommunityUpdatesDataContainer } from '../../containers/community-updates/CommunityUpdates';
import { useConfig } from '../../hooks';
import { ChallengeCommunityMessagesDocument, useChallengeUserIdsQuery } from '../../hooks/generated/graphql';
import { FEATURE_COMMUNICATIONS } from '../../models/constants';
import {
  ChallengeCommunityMessagesQuery,
  ChallengeCommunityMessagesQueryVariables,
  CommunicationMessageResult,
  User,
} from '../../models/graphql-schema';
import CommunitySection, { CommunitySectionPropsExt } from '../../views/CommunitySection/CommunitySectionView';
import { Loading } from '../core';

interface ChallengeCommunitySectionProps extends CommunitySectionPropsExt {
  ecoverseId: string;
  challengeId: string;
}

export const ChallengeCommunitySection: FC<ChallengeCommunitySectionProps> = ({ ecoverseId, challengeId, ...rest }) => {
  const { data: usersQuery, loading: usersLoading } = useChallengeUserIdsQuery({
    variables: {
      ecoverseId,
      challengeId,
    },
    errorPolicy: 'all',
  });
  const { isFeatureEnabled } = useConfig();

  const addCommunityUpdatesContainer = useCallback(
    (children: (messages: CommunicationMessageResult[]) => React.ReactElement) => {
      if (isFeatureEnabled(FEATURE_COMMUNICATIONS)) {
        return (
          <CommunityUpdatesDataContainer<ChallengeCommunityMessagesQuery, ChallengeCommunityMessagesQueryVariables>
            entities={{
              document: ChallengeCommunityMessagesDocument,
              variables: {
                ecoverseId,
                challengeId,
              },
              messageSelector: data => data?.ecoverse.challenge.community?.updatesRoom?.messages || [],
              roomIdSelector: data => data?.ecoverse.challenge.community?.updatesRoom?.id || '',
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
          users={(usersQuery?.ecoverse.challenge.community?.members as User[]) || []}
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

export default ChallengeCommunitySection;
