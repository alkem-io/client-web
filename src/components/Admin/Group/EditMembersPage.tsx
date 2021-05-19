import React, { FC, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useGroupQuery } from '../../../generated/graphql';
import { AuthorizationCredentialBackEnd } from '../../../hooks/useCredentialsResolver';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { Member } from '../../../models/User';
import { PageProps } from '../../../pages';
import Loading from '../../core/Loading';
import EditCredentials from '../Authorization/EditCredentials';
import { WithCommunity } from '../Community/CommunityTypes';

interface Parameters {
  groupId: string;
}

interface EditMembersPageProps extends PageProps, WithCommunity {
  parentMembers: Member[];
}

export const EditMembersPage: FC<EditMembersPageProps> = ({ paths, parentMembers = [] }) => {
  const { groupId } = useParams<Parameters>();
  const { data, loading } = useGroupQuery({ variables: { id: groupId } });
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'members', real: false }], [paths, data]);
  useUpdateNavigation({ currentPaths });

  if (loading) return <Loading text={'Loading group'} />;

  return (
    <Container>
      <EditCredentials
        credential={AuthorizationCredentialBackEnd.UserGroupMember}
        resourceId={Number(groupId)}
        parentMembers={parentMembers}
      />
    </Container>
  );
};

export default EditMembersPage;
