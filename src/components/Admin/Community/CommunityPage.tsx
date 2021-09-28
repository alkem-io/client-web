import React, { FC, useMemo } from 'react';
import { Container } from '@material-ui/core';
import { useRouteMatch } from 'react-router-dom';
import { useUpdateNavigation } from '../../../hooks';
import EditCommunityMembers, { CommunityCredentials } from '../Authorization/EditCommunityMembers';
import { WithCommunity, WithOptionalMembersProps } from './CommunityTypes';

interface CommunityPageProps extends WithOptionalMembersProps, WithCommunity {
  credential: CommunityCredentials;
  resourceId: string;
}

export const CommunityPage: FC<CommunityPageProps> = ({ paths, parentMembers, credential, resourceId, community }) => {
  const { url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'members', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <Container maxWidth="xl">
      <EditCommunityMembers
        credential={credential}
        resourceId={resourceId}
        parentMembers={parentMembers}
        communityId={community?.id || ''}
      />
    </Container>
  );
};

export default CommunityPage;
