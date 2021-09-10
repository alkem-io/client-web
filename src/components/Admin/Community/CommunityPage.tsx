import React, { FC, useMemo } from 'react';
import { Container } from '@material-ui/core';
import { useRouteMatch } from 'react-router-dom';
import { useUpdateNavigation } from '../../../hooks';
import EditCommunityCredentials, { CommunityCredentials } from '../Authorization/EditCommunityCredentials';
import { WithCommunity, WithMaybeParentMembersProps } from './CommunityTypes';

interface CommunityPageProps extends WithMaybeParentMembersProps, WithCommunity {
  credential: CommunityCredentials;
  resourceId: string;
}

export const CommunityPage: FC<CommunityPageProps> = ({ paths, parentMembers, credential, resourceId, community }) => {
  const { url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'members', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <Container maxWidth="xl">
      <EditCommunityCredentials
        credential={credential}
        resourceId={resourceId}
        parentMembers={parentMembers}
        communityId={community?.id || ''}
      />
    </Container>
  );
};

export default CommunityPage;
