import { Container } from '@mui/material';
import useCommunityUpdates from '@/domain/communication/updates/CommunityUpdatesContainer/useCommunityUpdates';
import { CommunityUpdatesView } from '@/domain/community/community/views/CommunityUpdates/CommunityUpdatesView';

interface SpaceAdminCommunityUpdatesPageProps {
  communityId: string | undefined;
}

export const SpaceAdminCommunityUpdatesPage = ({ communityId }: SpaceAdminCommunityUpdatesPageProps) => {
  if (!communityId) {
    return <Container maxWidth="xl">No community</Container>;
  }

  return <SpaceAdminCommunityUpdatesPageInner communityId={communityId} />;
};

const SpaceAdminCommunityUpdatesPageInner = ({ communityId }: { communityId: string }) => {
  const {
    entities: { messages, authors },
    actions,
    state,
  } = useCommunityUpdates({ communityId });

  return (
    <Container maxWidth="xl">
      <CommunityUpdatesView
        entities={{ messages, authors }}
        actions={{
          onSubmit: message => actions.onSubmit(message, communityId),
          onRemove: messageId => actions.onRemove(messageId, communityId),
        }}
        state={{
          loadingMessages: state.retrievingUpdateMessages,
          submittingMessage: state.sendingUpdateMessage,
          removingMessage: state.removingUpdateMessage,
        }}
        options={{
          canEdit: true,
          canCopy: true,
          canRemove: true,
        }}
      />
    </Container>
  );
};

export default SpaceAdminCommunityUpdatesPage;
