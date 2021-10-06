import { Container } from '@material-ui/core';
import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { WithCommunity } from '../../../components/Admin/Community/CommunityTypes';
import { Loading } from '../../../components/core';
import { CommunityUpdatesContainer } from '../../../containers/community-updates/CommunityUpdates';
import { AvatarsProvider } from '../../../context/AvatarsProvider';
import { useEcoverse, useUpdateNavigation } from '../../../hooks';
import { useCommunityMembersQuery } from '../../../hooks/generated/graphql';
import { User } from '../../../models/graphql-schema';
import { CommunityUpdatesView } from '../../../views/CommunityUpdates/CommunityUpdatesView';
import { PageProps } from '../../common';

interface CommunityUpdatesPageProps extends PageProps, WithCommunity {}

export const CommunityUpdatesPage: FC<CommunityUpdatesPageProps> = ({ paths, communityId }) => {
  const { url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'updates', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });
  const { ecoverseId, loading: loadingEcoverse } = useEcoverse();
  const { data, loading: loadingCommunity } = useCommunityMembersQuery({
    variables: { ecoverseId, communityId: communityId || '' },
    skip: !communityId,
  });
  const members = (data?.ecoverse.community?.members || []) as User[];

  if (loadingCommunity || loadingEcoverse) return <Loading />;

  if (!communityId) {
    return <Container maxWidth="xl">No community</Container>;
  }

  return (
    <Container maxWidth="xl">
      <CommunityUpdatesContainer entities={{ communityId }}>
        {(entities, actions, loading) => (
          <AvatarsProvider users={members}>
            {populatedUsers => (
              <CommunityUpdatesView
                entities={{ ...entities, members: populatedUsers }}
                actions={{
                  onSubmit: message => actions.onSubmit(message, communityId),
                  onRemove: messageId => actions.onRemove(messageId, communityId),
                }}
                state={{
                  loadingMessages: loading.retrievingUpdateMessages,
                  submittingMessage: loading.sendingUpdateMessage,
                  removingMessage: loading.removingUpdateMessage,
                }}
                options={{
                  canEdit: true,
                  canCopy: true,
                  canRemove: true,
                }}
              />
            )}
          </AvatarsProvider>
        )}
      </CommunityUpdatesContainer>
    </Container>
  );
};

export default CommunityUpdatesPage;
