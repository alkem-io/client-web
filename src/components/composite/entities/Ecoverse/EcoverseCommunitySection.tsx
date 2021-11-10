import React, { FC, useCallback, useMemo } from 'react';
import {
  CommunityUpdatesDataContainer,
  CommunityUpdatesDataEntities,
} from '../../../../containers/community-updates/CommunityUpdates';
import { useConfig, useEcoverse } from '../../../../hooks';
import { EcoverseCommunityMessagesDocument, useEcoverseUserIdsQuery } from '../../../../hooks/generated/graphql';
import { FEATURE_COMMUNICATIONS } from '../../../../models/constants';
import {
  EcoverseCommunityMessagesQuery,
  EcoverseCommunityMessagesQueryVariables,
  User,
} from '../../../../models/graphql-schema';
import CommunitySection, { CommunitySectionPropsExt } from '../../../../views/CommunitySection/CommunitySectionView';
import { Loading } from '../../../core';
import { useDiscussionsContext } from '../../../../context/Discussions/DiscussionsProvider';

interface EcoverseCommunitySectionProps extends CommunitySectionPropsExt {}

export const EcoverseCommunitySection: FC<EcoverseCommunitySectionProps> = ({ ...rest }) => {
  const { ecoverseNameId } = useEcoverse();
  const { discussionList } = useDiscussionsContext();
  const { data: usersQuery, loading: usersLoading } = useEcoverseUserIdsQuery({
    variables: {
      ecoverseId: ecoverseNameId,
    },
    errorPolicy: 'all',
  });
  const { isFeatureEnabled } = useConfig();

  const addCommunityUpdatesContainer = useCallback(
    (children: (entities?: CommunityUpdatesDataEntities) => React.ReactElement) => {
      if (isFeatureEnabled(FEATURE_COMMUNICATIONS) && ecoverseNameId) {
        return (
          <CommunityUpdatesDataContainer<EcoverseCommunityMessagesQuery, EcoverseCommunityMessagesQueryVariables>
            entities={{
              document: EcoverseCommunityMessagesDocument,
              variables: {
                ecoverseId: ecoverseNameId,
              },
              messageSelector: data => data?.ecoverse.community?.communication?.updates?.messages || [],
              roomIdSelector: data => data?.ecoverse.community?.communication?.updates?.id || '',
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
    [isFeatureEnabled, ecoverseNameId]
  );

  const memoizedNode = useMemo(
    () =>
      addCommunityUpdatesContainer(entities => (
        <CommunitySection
          users={(usersQuery?.ecoverse.community?.members as User[]) || []}
          updates={entities?.messages}
          updateSenders={entities?.senders}
          discussions={discussionList}
          {...rest}
        />
      )),
    [addCommunityUpdatesContainer, usersQuery, discussionList]
  );

  if (usersLoading) return <Loading text={'Loading community data'} />;

  return memoizedNode;
};
export default EcoverseCommunitySection;
