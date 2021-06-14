import React, { FC, useCallback, useMemo } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { GroupDetailsFragmentDoc, useCreateGroupOnCommunityMutation } from '../../../generated/graphql';
import { useApolloErrorHandler } from '../../../hooks/useApolloErrorHandler';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { PageProps } from '../../../pages';
import CreateGroupForm from '../Common/CreateGroupForm';
import { WithCommunity } from './CommunityTypes';

interface CreateCommunityGroupProps extends WithCommunity, PageProps {}

export const CreateCommunityGroup: FC<CreateCommunityGroupProps> = ({ paths, community }) => {
  const history = useHistory();
  const { url } = useRouteMatch();

  const handleError = useApolloErrorHandler();

  const redirectToCreatedGroup = (groupId: string) => {
    const newGroupPath = url.replace('/new', `/${groupId}`);
    history.replace(newGroupPath);
  };

  const [createGroup] = useCreateGroupOnCommunityMutation({
    onCompleted: data => redirectToCreatedGroup(data.createGroupOnCommunity.id),
    onError: handleError,
    update: (cache, { data }) => {
      if (data && community) {
        const { createGroupOnCommunity: newGroup } = data;
        cache.modify({
          id: cache.identify(community),
          fields: {
            groups(existingGroups = []) {
              const newGroupRef = cache.writeFragment({
                data: newGroup,
                fragment: GroupDetailsFragmentDoc,
              });
              return [...existingGroups, newGroupRef];
            },
          },
        });
      }
    },
  });

  const handleCreate = useCallback(
    async (name: string) => {
      if (community)
        await createGroup({
          variables: {
            input: {
              parentID: community.id,
              name,
            },
          },
        });
    },
    [community]
  );

  const currentPaths = useMemo(() => [...paths, { name: 'new', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return <CreateGroupForm onCreate={handleCreate} />;
};
