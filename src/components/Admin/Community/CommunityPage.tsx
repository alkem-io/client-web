import React, { FC, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { useRouteMatch } from 'react-router-dom';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { Member } from '../../../models/User';
import { PageProps } from '../../../pages';
import { AuthorizationCredential } from '../../../types/graphql-schema';
import EditCredentials from '../Authorization/EditCredentials';
import { WithCommunity } from './CommunityTypes';

interface CommunityPageProps extends PageProps, WithCommunity {
  parentMembers: Member[];
}

export const CommunityPage: FC<CommunityPageProps> = ({ paths, parentMembers = [], community }) => {
  const { url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'members', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <Container>
      <EditCredentials
        credential={AuthorizationCredential.UserGroupMember}
        resourceId={community?.id}
        parentMembers={parentMembers}
      />
    </Container>
  );
};

export default CommunityPage;
