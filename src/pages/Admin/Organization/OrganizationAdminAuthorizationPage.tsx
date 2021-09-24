import { Container } from '@material-ui/core';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import EditMembers from '../../../components/Admin/Community/EditMembers';
import OrganizationMembers from '../../../containers/organization/OrganizationMembers';
import { useOrganization, useUpdateNavigation } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import OrganizationAuthorizationPageProps from './OrganizationAuthorizationPageProps';

export const OrganizationAdminAuthorizationPage: FC<OrganizationAuthorizationPageProps> = ({ paths }) => {
  const { t } = useTranslation();

  const currentPaths = useMemo(
    () => [
      ...paths,
      {
        value: '',
        name: t(`common.enums.authorization-credentials.${AuthorizationCredential.OrganizationAdmin}.name` as const),
        real: false,
      },
    ],
    [paths]
  );

  useUpdateNavigation({ currentPaths });

  const { organizationId } = useOrganization();

  return (
    <Container maxWidth="xl">
      <OrganizationMembers
        entities={{
          organizationId,
          credential: AuthorizationCredential.OrganizationAdmin,
        }}
      >
        {(entities, actions, state) => (
          <EditMembers
            members={entities.allMembers}
            availableMembers={entities.availableMembers}
            addingMember={state.addingAdmin}
            removingMember={state.removingAdmin}
            executor={entities.currentMember}
            onAdd={actions.handleAssignAdmin}
            onRemove={actions.handleRemoveAdmin}
            loadingMembers={state.loading}
            loadingAvailableMembers={state.loading}
          />
        )}
      </OrganizationMembers>
    </Container>
  );
};

export default OrganizationAdminAuthorizationPage;
