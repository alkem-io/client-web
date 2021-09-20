import { Container } from '@material-ui/core';
import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import EditMembers from '../../../components/Admin/Community/EditMembers';
import OrganizationMembers from '../../../containers/organization/OrganizationMembers';
import { useUpdateNavigation } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { OrganizationRouteParams } from '../../../routing/admin/organization/organization';
import { PageProps } from '../../common';
import { useUsersQuery } from '../../../hooks/generated/graphql';

interface OrganizationCommunityPageProps extends PageProps {}

export const OrganizationCommunityPage: FC<OrganizationCommunityPageProps> = ({ paths }) => {
  useUpdateNavigation({ currentPaths: paths });

  const { organizationId } = useParams<OrganizationRouteParams>();
  const { data } = useUsersQuery();
  const allUsers = data?.users;

  return (
    <Container maxWidth="xl">
      <OrganizationMembers
        entities={{
          organizationId: organizationId,
          parentMembers: allUsers,
          credential: AuthorizationCredential.OrganizationMember,
        }}
      >
        {(entities, actions, state) => (
          <EditMembers
            members={entities.allMembers}
            availableMembers={entities.availableMembers}
            addingMember={state.addingUser}
            removingMember={state.removingUser}
            executor={entities.currentMember}
            onAdd={actions.handleAssignMember}
            onRemove={actions.handleRemoveMember}
          />
        )}
      </OrganizationMembers>
    </Container>
  );
};

export default OrganizationCommunityPage;
