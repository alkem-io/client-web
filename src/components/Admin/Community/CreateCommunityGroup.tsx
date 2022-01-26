import React, { FC, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GroupDetailsFragmentDoc, useCreateGroupOnCommunityMutation } from '../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';
import { useUpdateNavigation } from '../../../hooks';
import { PageProps } from '../../../pages';
import CreateGroupForm from '../Common/CreateGroupForm';
import { WithCommunity } from './CommunityTypes';

interface CreateCommunityGroupProps extends WithCommunity, PageProps {}

export const CreateCommunityGroup: FC<CreateCommunityGroupProps> = ({ paths, communityId }) => {
  const navigate = useNavigate();

  const handleError = useApolloErrorHandler();

  const redirectToCreatedGroup = (groupId: string) => {
    navigate(`../${groupId}`, { replace: true });
  };

  const [createGroup] = useCreateGroupOnCommunityMutation({
    onCompleted: data => redirectToCreatedGroup(data.createGroupOnCommunity.id),
    onError: handleError,
    update: (cache, { data }) => {
      if (data && communityId) {
        const { createGroupOnCommunity: newGroup } = data;
        cache.modify({
          id: cache.identify({
            __typename: 'Community', // TODO: Find a way to generate it.
            id: communityId,
          }),
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
      if (communityId)
        await createGroup({
          variables: {
            input: {
              parentID: communityId,
              name,
            },
          },
        });
    },
    [communityId]
  );

  const currentPaths = useMemo(() => [...paths, { name: 'new', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return <CreateGroupForm onCreate={handleCreate} />;
};
