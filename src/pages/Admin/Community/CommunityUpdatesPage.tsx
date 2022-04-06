import { Container } from '@mui/material';
import React, { FC } from 'react';
import { WithCommunity } from '../../../components/Admin/Community/CommunityTypes';
import { CommunityUpdatesContainer } from '../../../containers/community-updates/CommunityUpdatesContainer';
import { AvatarsProvider } from '../../../context/AvatarsProvider';
import { useHub } from '../../../hooks';
import { CommunityUpdatesView } from '../../../views/CommunityUpdates/CommunityUpdatesView';

interface CommunityUpdatesPageProps extends WithCommunity {}

export const CommunityUpdatesPage: FC<CommunityUpdatesPageProps> = ({ communityId }) => {
  const { hubId } = useHub();

  if (!communityId || !hubId) {
    return <Container maxWidth="xl">No community</Container>;
  }

  return (
    <Container maxWidth="xl">
      <CommunityUpdatesContainer entities={{ hubId, communityId }}>
        {({ messages, senders }, actions, loading) => (
          <AvatarsProvider users={senders}>
            {populatedUsers => (
              <CommunityUpdatesView
                entities={{ messages, members: populatedUsers }}
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
