import { Container } from '@material-ui/core';
import React, { FC } from 'react';
import EditMembers from '../../../components/Admin/Community/EditMembers';
import OrganizationMembers from '../../../containers/organization/OrganizationMembers';
import { useOrganization, useUpdateNavigation } from '../../../hooks';
import { useUsersQuery } from '../../../hooks/generated/graphql';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { PageProps } from '../../common';

interface OrganizationCommunityPageProps extends PageProps {}

export const OrganizationCommunityPage: FC<OrganizationCommunityPageProps> = ({ paths }) => {
  useUpdateNavigation({ currentPaths: paths });

  const { organizationId } = useOrganization();

  const { data } = useUsersQuery();
  const allUsers = data?.users;

  return (
    <Container maxWidth="xl">
      <OrganizationMembers
        entities={{
          organizationId,
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
