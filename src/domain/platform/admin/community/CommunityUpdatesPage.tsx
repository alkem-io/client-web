import { Container } from '@mui/material';
import React, { FC } from 'react';
import { WithCommunity } from '../components/Community/CommunityTypes';
import { CommunityUpdatesContainer } from '../../../communication/updates/CommunityUpdatesContainer/CommunityUpdatesContainer';
import { useSpace } from '../../../journey/space/SpaceContext/useSpace';
import { CommunityUpdatesView } from '../../../community/community/views/CommunityUpdates/CommunityUpdatesView';

interface CommunityUpdatesPageProps extends WithCommunity {}

export const CommunityUpdatesPage: FC<CommunityUpdatesPageProps> = ({ communityId }) => {
  const { spaceId } = useSpace();

  if (!communityId || !spaceId) {
    return <Container maxWidth="xl">No community</Container>;
  }

  return (
    <Container maxWidth="xl">
      <CommunityUpdatesContainer entities={{ spaceId, communityId }}>
        {({ messages, authors }, actions, loading) => (
          <CommunityUpdatesView
            entities={{ messages, authors }}
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
      </CommunityUpdatesContainer>
    </Container>
  );
};

export default CommunityUpdatesPage;
