import React, { FC, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { useRouteMatch } from 'react-router-dom';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { Member } from '../../../models/User';
import { PageProps } from '../../../pages';
import EditCommunityCredentials, { CommunityCredentials } from '../Authorization/EditCommunityCredentials';
import { WithCommunity } from './CommunityTypes';

interface CommunityPageProps extends PageProps, WithCommunity {
  parentMembers: Member[];
  credential: CommunityCredentials;
  resourceId: string;
}

export const CommunityPage: FC<CommunityPageProps> = ({
  paths,
  parentMembers = [],
  credential,
  resourceId,
  community,
}) => {
  const { url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'members', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <Container>
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
