import React, { FC, useCallback, useMemo } from 'react';
import { useHistory, useParams, useRouteMatch } from 'react-router-dom';
import { useCreateGroupOnOrganizationMutation, useOrganizationNameQuery } from '../../../generated/graphql';
import { GROUP_DETAILS_FRAGMENT } from '../../../graphql/community';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { PageProps } from '../../../pages';
import CreateGroupForm from '../Common/CreateGroupForm';

export const CreateOrganizationGroupPage: FC<PageProps> = ({ paths }) => {
  const history = useHistory();
  const { url } = useRouteMatch();
  const { organizationId } = useParams<{ organizationId: string }>();
  const handleError = e => console.log(e);

  const { data: organizationQuery } = useOrganizationNameQuery({ variables: { id: organizationId } });
  const organization = organizationQuery?.organisation;

  const redirectToCreatedGroup = (groupId: string) => {
    const newGroupPath = url.replace('/new', `/${groupId}`);
    history.replace(newGroupPath);
  };

  const [createGroup] = useCreateGroupOnOrganizationMutation({
    onCompleted: data => redirectToCreatedGroup(data.createGroupOnOrganisation.id),
    onError: handleError,
    update: (cache, { data }) => {
      if (data && organization) {
        const { createGroupOnOrganisation: newGroup } = data;
        cache.modify({
          id: cache.identify(organization),
          fields: {
            groups(existingGroups = []) {
              const newUserRef = cache.writeFragment({
                data: newGroup,
                fragment: GROUP_DETAILS_FRAGMENT,
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
            parentID: Number(organizationId),
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
