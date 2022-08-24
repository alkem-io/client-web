import React from 'react';
import CommunityUpdatesDashboardSection from './CommunityUpdatesDashboardSection';
import { CommunityUpdatesContainer } from '../../../containers/community-updates/CommunityUpdatesContainer';

export interface CommunityUpdatesProps {
  hubId?: string;
  communityId?: string;
}

const CommunityUpdates = ({ hubId, communityId }: CommunityUpdatesProps) => {
  return (
    <CommunityUpdatesContainer entities={{ hubId, communityId }}>
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
