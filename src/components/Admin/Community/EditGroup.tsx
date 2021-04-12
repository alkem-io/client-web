import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import {
  useAddUserToGroupMutation,
  useGroupMembersQuery,
  useRemoveUserFromGroupMutation,
} from '../../../generated/graphql';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { Member } from '../../../models/User';
import { PageProps } from '../../../pages';
import EditMembers from './EditMembers';

interface EditGroupProps extends PageProps {
  groupId: string;
  parentMembers: Member[];
}

export const EditGroup: FC<EditGroupProps> = ({ paths, groupId, parentMembers }) => {
  const { data } = useGroupMembersQuery({
    variables: { id: groupId },
  });
  const [addUser] = useAddUserToGroupMutation();
  const [removeUser] = useRemoveUserFromGroupMutation();

  const name = data?.ecoverse.group.name || '';
  const members = useMemo(() => data?.ecoverse.group.members || [], [data, groupId]);
  const { url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name, real: true }], [paths, data]);

  useUpdateNavigation({ currentPaths });

  const handleAdd = (member: Member) => {
    addUser({
      variables: {
        input: {
          parentID: Number(groupId),
          childID: Number(member.id),
        },
      },
      refetchQueries: ['groupMembers'],
      awaitRefetchQueries: true,
    });
  };
  const handleRemove = (member: Member) => {
    removeUser({
      variables: {
        input: {
          parentID: Number(groupId),
          childID: Number(member.id),
        },
      },
      refetchQueries: ['groupMembers'],
      awaitRefetchQueries: true,
    });
  };

  const availableMembers = useMemo(() => {
    return parentMembers.filter(p => members.findIndex(m => m.id === p.id) < 0);
  }, [parentMembers, members]);

  return (
    <EditMembers members={members} availableMembers={availableMembers} onAdd={handleAdd} onRemove={handleRemove} />
  );
};
export default EditGroup;
