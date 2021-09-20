import { Container } from '@material-ui/core';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import EditMembers from '../../../components/Admin/Community/EditMembers';
import OrganizationMembers from '../../../containers/organization/OrganizationMembers';
import { useOrganization, useUpdateNavigation } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import OrganizationAuthorizationPageProps from './OrganizationAuthorizationPageProps';

export const OrganizationOwnerAuthorizationPage: FC<OrganizationAuthorizationPageProps> = ({ paths }) => {
  const { t } = useTranslation();

  const currentPaths = useMemo(
    () => [
      ...paths,
      {
        value: '',
        name: t(`common.enums.authorization-credentials.${AuthorizationCredential.OrganizationOwner}.name` as const),
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
          credential: AuthorizationCredential.OrganizationOwner,
        }}
      >
        {(entities, actions, state) => (
          <EditMembers
            members={entities.allMembers}
            availableMembers={entities.availableMembers}
            addingMember={state.addingOwner}
            removingMember={state.removingOwner}
            executor={entities.currentMember}
            onAdd={actions.handleAssignOwner}
            onRemove={actions.handleRemoveOwner}
          />
        )}
      </OrganizationMembers>
    </Container>
  );
};

export default OrganizationOwnerAuthorizationPage;
