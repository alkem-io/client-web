import { gql } from '@apollo/client';
import React, { FC, useCallback, useMemo } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useCreateGroupOnCommunityMutation } from '../../../generated/graphql';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { PageProps } from '../../../pages';
import CreateGroupForm from '../Common/CreateGroupForm';
import { WithCommunity } from './CommunityTypes';

interface CreateCommunityGroupProps extends WithCommunity, PageProps {}

export const CreateCommunityGroup: FC<CreateCommunityGroupProps> = ({ paths, community }) => {
  const history = useHistory();
  const { url } = useRouteMatch();

  const handleError = e => console.log(e);

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
              const newUserRef = cache.writeFragment({
                data: newGroup,
                // TODO: [ATS] Move this fragment outside.
                fragment: gql`
                  fragment userGroupDetails on UserGroup {
                    id
                    name
                  }
                `,
              });
              return [...existingGroups, newUserRef];
            },
          },
        });
      }
    },
  });

  const handleCreate = useCallback(
    async (name: string) => {
      await createGroup({
        variables: {
          communityID: Number(community?.id),
          groupName: name,
        },
      });
    },
    [community]
  );

  const currentPaths = useMemo(() => [...paths, { name: 'new', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return <CreateGroupForm onCreate={handleCreate} />;
};
