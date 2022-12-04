import React, { FC, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsSection } from '../../layout/EntitySettings/constants';
import OrganizationAdminLayout from '../../organization/OrganizationAdminLayout';
import { useOrganization } from '../../../../community/contributor/organization/hooks/useOrganization';
import { useApolloErrorHandler } from '../../../../../core/apollo/hooks/useApolloErrorHandler';
import { useUpdateNavigation } from '../../../../../core/routing/useNavigation';
import {
  GroupDetailsFragmentDoc,
  useCreateGroupOnOrganizationMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { PageProps } from '../../../../shared/types/PageProps';
import CreateGroupForm from '../Common/CreateGroupForm';

export const CreateOrganizationGroupPage: FC<PageProps> = ({ paths }) => {
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

  const currentPaths = useMemo(() => [...paths, { name: 'new', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <OrganizationAdminLayout currentTab={SettingsSection.Community} tabRoutePrefix="../../">
      <CreateGroupForm onCreate={handler} />
    </OrganizationAdminLayout>
  );
};
