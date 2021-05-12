import React, { FC, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { useRouteMatch } from 'react-router-dom';
import { AuthorizationCredentialBackEnd } from '../../../hooks/useCredentialsResolver';
import { Member } from '../../../models/User';
import { PageProps } from '../../../pages';
import EditCredentials from '../Authorization/EditCredentials';
import { WithCommunity } from './CommunityTypes';

interface CommunityPageProps extends PageProps, WithCommunity {
  parentMembers: Member[];
}

export const CommunityPage: FC<CommunityPageProps> = ({ paths, parentMembers = [], community }) => {
  const { url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'members', real: false }], [paths]);

  return (
    <Container>
      <EditCredentials
        credential={AuthorizationCredentialBackEnd.CommunityMember}
        resourceId={Number(community?.id)}
        parentMembers={parentMembers}
        paths={currentPaths}
      />
    </Container>
  );
};

export default CommunityPage;
