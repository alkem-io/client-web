import React, { FC, useCallback } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import OrganizationAdminLayout from '@/domain/community/organizationAdmin/layout/OrganizationAdminLayout';
import { useOrganization } from '@/domain/community/contributor/organization/hooks/useOrganization';
import { GroupDetailsFragmentDoc, useCreateGroupOnOrganizationMutation } from '@/core/apollo/generated/apollo-hooks';
import CreateGroupForm from '../Common/CreateGroupForm';

export const CreateOrganizationGroupPage: FC = () => {
  const navigate = useNavigate();
  const { organizationId, organization } = useOrganization();

  const redirectToCreatedGroup = (groupId: string) => {
    navigate(`../${groupId}`);
  };

  const [createGroup] = useCreateGroupOnOrganizationMutation({
    onCompleted: data => redirectToCreatedGroup(data.createGroupOnOrganization.id),
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
            profile: {
              displayName: name,
            },
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
