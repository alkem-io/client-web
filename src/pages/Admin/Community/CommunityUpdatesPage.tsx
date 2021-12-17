import { Container } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { WithCommunity } from '../../../components/Admin/Community/CommunityTypes';
import {
  CommunityUpdatesContainer,
  CommunityUpdatesDataContainer,
} from '../../../containers/community-updates/CommunityUpdates';
import { AvatarsProvider } from '../../../context/AvatarsProvider';
import { useEcoverse, useUpdateNavigation } from '../../../hooks';
import { CommunityUpdatesView } from '../../../views/CommunityUpdates/CommunityUpdatesView';
import { PageProps } from '../../common';

interface CommunityUpdatesPageProps extends PageProps, WithCommunity {}

export const CommunityUpdatesPage: FC<CommunityUpdatesPageProps> = ({ paths, communityId }) => {
  const { url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'updates', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const { ecoverseId } = useEcoverse();

  if (!communityId || !ecoverseId) {
    return <Container maxWidth="xl">No community</Container>;
  }

  return (
    <Container maxWidth="xl">
      <CommunityUpdatesDataContainer
        entities={{
          ecoverseId,
          communityId,
        }}
      >
        {({ messages, senders }, { retrievingUpdateMessages }) => (
          <CommunityUpdatesContainer entities={{ ecoverseId, communityId }}>
            {(entities, actions, loading) => (
              <AvatarsProvider users={senders}>
                {populatedUsers => (
                  <CommunityUpdatesView
                    entities={{ messages, members: populatedUsers }}
                    actions={{
                      onSubmit: message => actions.onSubmit(message, communityId),
                      onRemove: messageId => actions.onRemove(messageId, communityId),
                    }}
                    state={{
                      loadingMessages: loading.retrievingUpdateMessages || retrievingUpdateMessages,
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
        )}
      </CommunityUpdatesDataContainer>
    </Container>
  );
};

export default CommunityUpdatesPage;
