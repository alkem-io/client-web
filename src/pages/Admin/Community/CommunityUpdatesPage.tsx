import { Container } from '@material-ui/core';
import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { WithCommunity } from '../../../components/Admin/Community/CommunityTypes';
import { CommunityUpdatesContainer } from '../../../containers/community-updates/CommunityUpdates';
import { AvatarsProvider } from '../../../context/AvatarsProvider';
import { useUpdateNavigation } from '../../../hooks';
import { User } from '../../../models/graphql-schema';
import { CommunityUpdatesView } from '../../../views/CommunityUpdates/CommunityUpdatesView';
import { PageProps } from '../../common';

interface CommunityUpdatesPageProps extends PageProps, WithCommunity {}

export const CommunityUpdatesPage: FC<CommunityUpdatesPageProps> = ({ paths, community }) => {
  const { url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'updates', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  if (!community) {
    return <Container maxWidth="xl">No community</Container>;
  }

  return (
    <Container maxWidth="xl">
      <CommunityUpdatesContainer entities={{ communityId: community.id }}>
        {(entities, actions, loading) => (
          <AvatarsProvider users={community.members as User[]}>
            {populatedUsers => (
              <CommunityUpdatesView
                entities={{ ...entities, members: populatedUsers }}
                actions={{
                  onSubmit: message => actions.onSubmit(message, community.id),
                }}
                state={{
                  loadingMessages: loading.retrievingUpdateMessages,
                  submittingMessage: loading.sendingUpdateMessage,
                }}
                options={{
                  canEdit: true,
                  canCopy: true,
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
