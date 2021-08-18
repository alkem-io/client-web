import { Container } from '@material-ui/core';
import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import OrganizationMembers from '../../../containers/organisation/OrganizationMembers';
import { useUpdateNavigation } from '../../../hooks';
import { Member } from '../../../models/User';
import { PageProps } from '../..';
import { OrganizationRouteParams } from '../../../routing/admin/organisation/organization';
import EditMembers from '../../../components/Admin/Community/EditMembers';

interface OrganisationCommunityPageProps extends PageProps {
  parentMembers: Member[];
}

export const OrganisationCommunityPage: FC<OrganisationCommunityPageProps> = ({ paths, parentMembers = [] }) => {
  useUpdateNavigation({ currentPaths: paths });

  const { organizationId } = useParams<OrganizationRouteParams>();

  return (
    <Container maxWidth="xl">
      <OrganizationMembers entities={{ organisationId: organizationId, parentMembers }}>
        {(entities, actions, state) => (
          <EditMembers
            members={entities.allMembers}
            availableMembers={entities.availableMembers}
            addingUser={state.addingUser}
            removingUser={state.removingUser}
            onAdd={actions.handleAdd}
            onRemove={actions.handleRemove}
          />
        )}
      </OrganizationMembers>
    </Container>
  );
};

export default OrganisationCommunityPage;
