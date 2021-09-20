import { Container } from '@material-ui/core';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import EditMembers from '../../../components/Admin/Community/EditMembers';
import OrganizationMembers from '../../../containers/organisation/OrganizationMembers';
import { useUpdateNavigation, useUrlParams } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import OrganisationAuthorizationPageProps from './OrganisationAuthorizationPageProps';

export const OrganisationAdminAuthorizationPage: FC<OrganisationAuthorizationPageProps> = ({ paths }) => {
  const { t } = useTranslation();

  const currentPaths = useMemo(
    () => [
      ...paths,
      {
        value: '',
        name: t(`common.enums.authorization-credentials.${AuthorizationCredential.OrganisationAdmin}.name` as const),
        real: false,
      },
    ],
    [paths]
  );

  useUpdateNavigation({ currentPaths });

  const { organizationId } = useUrlParams();
  return (
    <Container maxWidth="xl">
      <OrganizationMembers
        entities={{
          organizationId: organizationId,
          credential: AuthorizationCredential.OrganisationAdmin,
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
          />
        )}
      </OrganizationMembers>
    </Container>
  );
};

export default OrganisationAdminAuthorizationPage;
