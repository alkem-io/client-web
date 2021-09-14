import { Container } from '@material-ui/core';
import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import EditMembers from '../../../components/Admin/Community/EditMembers';
import OrganizationMembers from '../../../containers/organisation/OrganizationMembers';
import { useUpdateNavigation } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { OrganizationRouteParams } from '../../../routing/admin/organisation/organization';
import { PageProps } from '../../common';
import { useUsersQuery } from '../../../hooks/generated/graphql';

interface OrganisationCommunityPageProps extends PageProps {}

export const OrganisationCommunityPage: FC<OrganisationCommunityPageProps> = ({ paths }) => {
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
          credential: AuthorizationCredential.OrganisationMember,
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

export default OrganisationCommunityPage;
