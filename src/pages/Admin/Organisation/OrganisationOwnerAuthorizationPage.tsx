import { Container } from '@material-ui/core';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import EditMembers from '../../../components/Admin/Community/EditMembers';
import OrganizationMembers from '../../../containers/organisation/OrganizationMembers';
import { useUpdateNavigation } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { OrganizationRouteParams } from '../../../routing/admin/organisation/organization';
import OrganisationAuthorizationPageProps from './OrganisationAuthorizationPageProps';

export const OrganisationOwnerAuthorizationPage: FC<OrganisationAuthorizationPageProps> = ({ paths }) => {
  const { t } = useTranslation();

  const currentPaths = useMemo(
    () => [
      ...paths,
      {
        value: '',
        name: t(`common.enums.authorization-credentials.${AuthorizationCredential.OrganisationOwner}.name` as const),
        real: false,
      },
    ],
    [paths]
  );

  useUpdateNavigation({ currentPaths });

  const { organizationId } = useParams<OrganizationRouteParams>();
  return (
    <Container maxWidth="xl">
      <OrganizationMembers
        entities={{
          organisationId: organizationId,
          credential: AuthorizationCredential.OrganisationOwner,
        }}
      >
        {(entities, actions, state) => (
          <EditMembers
            members={entities.allMembers}
            availableMembers={entities.availableMembers}
            addingMember={state.addingOwner}
            removingMember={state.removingOwner}
            executor={entities.currentMember}
            onAdd={actions.handleAssignAdmin}
            onRemove={actions.handleRemoveAdmin}
          />
        )}
      </OrganizationMembers>
    </Container>
  );
};

export default OrganisationOwnerAuthorizationPage;
