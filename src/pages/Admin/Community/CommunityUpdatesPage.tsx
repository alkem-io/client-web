import { Container } from '@material-ui/core';
import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { WithCommunity } from '../../../components/Admin/Community/CommunityTypes';
import { CommunityUpdatesContainer } from '../../../containers/community-updates/CommunityUpdates';
import { useUpdateNavigation } from '../../../hooks';
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
          <CommunityUpdatesView
            entities={{ ...entities, members: community.members }}
            actions={{
              onSubmit: message => actions.onSubmit(message, community.id),
            }}
            state={{
              loadingMessages: loading.retrievingUpdateMessages,
              submittingMessage: loading.sendingUpdateMessage,
            }}
            options={{
              edit: true,
            }}
          />
        )}
      </CommunityUpdatesContainer>
    </Container>
  );
};

export default CommunityUpdatesPage;
