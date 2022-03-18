import { Container } from '@mui/material';
import React, { FC } from 'react';
import EditMembers from '../../../components/Admin/Community/EditMembers';
import OrganizationMembers from '../../../containers/organization/OrganizationMembers';
import { useOrganization, useUpdateNavigation } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { PageProps } from '../../common';

interface OrganizationCommunityPageProps extends PageProps {}

export const OrganizationCommunityPage: FC<OrganizationCommunityPageProps> = ({ paths }) => {
  useUpdateNavigation({ currentPaths: paths });

  const { organizationId } = useOrganization();

  return (
    <Container maxWidth="xl">
      <OrganizationMembers
        entities={{
          organizationId,
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
            onLoadMore={actions.handleLoadMore}
            lastMembersPage={state.isLastAvailableUserPage}
            loadingMembers={state.loading}
            loadingAvailableMembers={state.loading}
          />
        )}
      </OrganizationMembers>
    </Container>
  );
};

export default OrganizationCommunityPage;
