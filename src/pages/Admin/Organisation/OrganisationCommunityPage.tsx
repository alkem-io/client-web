import { Container } from '@material-ui/core';
import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { WithParentMembersProps } from '../../../components/Admin/Community/CommunityTypes';
import EditMembers from '../../../components/Admin/Community/EditMembers';
import OrganizationMembers from '../../../containers/organisation/OrganizationMembers';
import { useUpdateNavigation } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { OrganizationRouteParams } from '../../../routing/admin/organisation/organization';

interface OrganisationCommunityPageProps extends WithParentMembersProps {}

export const OrganisationCommunityPage: FC<OrganisationCommunityPageProps> = ({ paths, parentMembers = [] }) => {
  useUpdateNavigation({ currentPaths: paths });

  const { organizationId } = useParams<OrganizationRouteParams>();

  return (
    <Container maxWidth="xl">
      <OrganizationMembers
        entities={{
          organisationId: organizationId,
          parentMembers,
          credential: AuthorizationCredential.OrganisationMember,
        }}
      >
        {(entities, actions, state) => (
          <EditMembers
            members={entities.allMembers}
            availableMembers={entities.availableMembers}
            addingUser={state.addingUser}
            removingUser={state.removingUser}
            onAdd={actions.handleAssignMember}
            onRemove={actions.handleRemoveMember}
          />
        )}
      </OrganizationMembers>
    </Container>
  );
};

export default OrganisationCommunityPage;
