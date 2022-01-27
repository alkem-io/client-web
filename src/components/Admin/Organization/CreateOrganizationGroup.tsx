import React, { FC, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApolloErrorHandler, useOrganization, useUpdateNavigation } from '../../../hooks';
import { GroupDetailsFragmentDoc, useCreateGroupOnOrganizationMutation } from '../../../hooks/generated/graphql';
import { PageProps } from '../../../pages';
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
    [organizationId]
  );

  const currentPaths = useMemo(() => [...paths, { name: 'new', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return <CreateGroupForm onCreate={handler} />;
};
