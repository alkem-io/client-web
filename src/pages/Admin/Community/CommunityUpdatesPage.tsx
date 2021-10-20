import { Container } from '@material-ui/core';
import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { WithCommunity } from '../../../components/Admin/Community/CommunityTypes';
import { CommunityUpdatesContainer } from '../../../containers/community-updates/CommunityUpdates';
import { AvatarsProvider } from '../../../context/AvatarsProvider';
import { useUpdateNavigation } from '../../../hooks';
import { CommunityUpdatesView } from '../../../views/CommunityUpdates/CommunityUpdatesView';
import { PageProps } from '../../common';

interface CommunityUpdatesPageProps extends PageProps, WithCommunity {}

export const CommunityUpdatesPage: FC<CommunityUpdatesPageProps> = ({ paths, communityId }) => {
  const { url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'updates', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  if (!communityId) {
    return <Container maxWidth="xl">No community</Container>;
  }

  return (
    <Container maxWidth="xl">
      <CommunityUpdatesContainer entities={{ communityId }}>
        {(entities, actions, loading) => (
          <AvatarsProvider users={entities.messages.map(m => ({ id: m.sender }))}>
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
