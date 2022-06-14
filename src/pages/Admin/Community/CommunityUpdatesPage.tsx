import { Container } from '@mui/material';
import React, { FC } from 'react';
import { WithCommunity } from '../../../components/Admin/Community/CommunityTypes';
import { CommunityUpdatesContainer } from '../../../containers/community-updates/CommunityUpdatesContainer';
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
