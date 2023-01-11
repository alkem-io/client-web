import React, { FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsSection } from '../../layout/EntitySettingsLayout/constants';
import OrganizationAdminLayout from '../../organization/OrganizationAdminLayout';
import { useOrganization } from '../../../../community/contributor/organization/hooks/useOrganization';
import { useApolloErrorHandler } from '../../../../../core/apollo/hooks/useApolloErrorHandler';
import {
  GroupDetailsFragmentDoc,
  useCreateGroupOnOrganizationMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import CreateGroupForm from '../Common/CreateGroupForm';

export const CreateOrganizationGroupPage: FC = () => {
  const navigate = useNavigate();
  const { organizationId, organization } = useOrganization();
  const handleError = useApolloErrorHandler();

  const redirectToCreatedGroup = (groupId: string) => {
    navigate(`../${groupId}`);
  };

  const [createGroup] = useCreateGroupOnOrganizationMutation({
    onCompleted: data => redirectToCreatedGroup(data.createGroupOnOrganization.id),
    onError: handleError,
    update: (cache, { data }) => {
      if (data && organization) {
        const { createGroupOnOrganization: newGroup } = data;
        cache.modify({
          id: cache.identify(organization),
          fields: {
            groups(existingGroups = []) {
              const newUserRef = cache.writeFragment({
                data: newGroup,
                fragment: GroupDetailsFragmentDoc,
              });
              return [...existingGroups, newUserRef];
            },
          },
        });
      }
    },
  });

  const handler = useCallback(
    async (name: string) => {
      createGroup({
        variables: {
          input: {
            parentID: organizationId,
            name,
          },
        },
      });
    },
    [organizationId, createGroup]
  );

  return (
    <OrganizationAdminLayout currentTab={SettingsSection.Community} tabRoutePrefix="../../">
      <CreateGroupForm onCreate={handler} />
    </OrganizationAdminLayout>
  );
};
