import React from 'react';
import CommunityUpdatesDashboardSection from './CommunityUpdatesDashboardSection';
import { CommunityUpdatesContainer } from '../../../communication/updates/CommunityUpdatesContainer/CommunityUpdatesContainer';

export interface CommunityUpdatesProps {
  spaceId?: string;
  communityId?: string;
}

const CommunityUpdates = ({ spaceId, communityId }: CommunityUpdatesProps) => {
  return (
    <CommunityUpdatesContainer entities={{ spaceId, communityId }}>
      {({ messages, authors }, actions, loading) => (
        <CommunityUpdatesDashboardSection
          messages={messages}
          messagesLoading={loading.retrievingUpdateMessages}
          authors={authors}
        />
      )}
    </CommunityUpdatesContainer>
  );
};

export default CommunityUpdates;
