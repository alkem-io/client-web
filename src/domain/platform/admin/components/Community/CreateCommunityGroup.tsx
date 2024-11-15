import React, { FC, useCallback } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import { GroupDetailsFragmentDoc, useCreateGroupOnCommunityMutation } from '@/core/apollo/generated/apollo-hooks';
import CreateGroupForm from '../Common/CreateGroupForm';

interface CreateCommunityGroupProps {
  communityId: string | undefined;
}

export const CreateCommunityGroup: FC<CreateCommunityGroupProps> = ({ communityId }) => {
  const navigate = useNavigate();

  const redirectToCreatedGroup = (groupId: string) => {
    navigate(`../${groupId}`, { replace: true });
  };

  const [createGroup] = useCreateGroupOnCommunityMutation({
    onCompleted: data => redirectToCreatedGroup(data.createGroupOnCommunity.id),
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
              profile: {
                displayName: name,
              },
            },
          },
        });
    },
    [communityId, createGroup]
  );

  return <CreateGroupForm onCreate={handleCreate} />;
};
