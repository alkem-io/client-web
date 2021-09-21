import React, { FC, useCallback, useMemo } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import {
  GroupDetailsFragmentDoc,
  useCreateGroupOnOrganizationMutation,
  useOrganizationNameQuery,
} from '../../../hooks/generated/graphql';
import { useApolloErrorHandler, useUrlParams } from '../../../hooks';
import { useUpdateNavigation } from '../../../hooks';
import { PageProps } from '../../../pages';
import CreateGroupForm from '../Common/CreateGroupForm';

export const CreateOrganizationGroupPage: FC<PageProps> = ({ paths }) => {
  const history = useHistory();
  const { url } = useRouteMatch();
  const { organizationNameId } = useUrlParams();
  const handleError = useApolloErrorHandler();

  const { data: organizationQuery } = useOrganizationNameQuery({ variables: { id: organizationNameId } });
  const organization = organizationQuery?.organization;

  const redirectToCreatedGroup = (groupId: string) => {
    const newGroupPath = url.replace('/new', `/${groupId}`);
    history.replace(newGroupPath);
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
            parentID: organizationNameId,
            name,
          },
        },
      });
    },
    [organizationNameId]
  );

  const currentPaths = useMemo(() => [...paths, { name: 'new', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return <CreateGroupForm onCreate={handler} />;
};
