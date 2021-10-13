import React, { FC, useCallback, useMemo } from 'react';
import { CommunityUpdatesDataContainer } from '../../../../containers/community-updates/CommunityUpdates';
import { useConfig, useEcoverse } from '../../../../hooks';
import { EcoversCommunityMessagesDocument, useEcoverseUserIdsQuery } from '../../../../hooks/generated/graphql';
import { FEATURE_COMMUNICATIONS } from '../../../../models/constants';
import {
  CommunicationMessageResult,
  EcoversCommunityMessagesQuery,
  EcoversCommunityMessagesQueryVariables,
  User,
} from '../../../../models/graphql-schema';
import CommunitySection, { CommunitySectionPropsExt } from '../../../../views/CommunitySection/CommunitySectionView';
import { Loading } from '../../../core';

interface EcoverseCommunitySectionProps extends CommunitySectionPropsExt {}

export const EcoverseCommunitySection: FC<EcoverseCommunitySectionProps> = ({ ...rest }) => {
  const { ecoverseNameId } = useEcoverse();
  const { data: usersQuery, loading: usersLoading } = useEcoverseUserIdsQuery({
    variables: {
      ecoverseId: ecoverseNameId,
    },
    errorPolicy: 'all',
  });
  const { isFeatureEnabled } = useConfig();

  const addCommunityUpdatesContainer = useCallback(
    (children: (messages: CommunicationMessageResult[]) => React.ReactElement) => {
      if (isFeatureEnabled(FEATURE_COMMUNICATIONS)) {
        return (
          <CommunityUpdatesDataContainer<EcoversCommunityMessagesQuery, EcoversCommunityMessagesQueryVariables>
            entities={{
              document: EcoversCommunityMessagesDocument,
              variables: {
                ecoverseId: ecoverseNameId,
              },
              messageSelector: data => data?.ecoverse.community?.updatesRoom?.messages || [],
              roomIdSelector: data => data?.ecoverse.community?.updatesRoom?.id || '',
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
          users={(usersQuery?.ecoverse.community?.members as User[]) || []}
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
export default EcoverseCommunitySection;
