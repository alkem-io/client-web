import React, { FC, useMemo } from 'react';
import {
  useAddUserToGroupMutation,
  useGroupMembersQuery,
  useRemoveUserFromGroupMutation,
} from '../../../generated/graphql';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { Member } from '../../../models/User';
import { PageProps } from '../../../pages';
import EditMembers from '../Group/EditMembers';

interface MembersPageProps extends PageProps {
  groupId: string;
  parentMembers: Member[];
}

export const MembersPage: FC<MembersPageProps> = ({ paths, groupId, parentMembers }) => {
  useUpdateNavigation({ currentPaths: paths });

  const { data } = useGroupMembersQuery({
    variables: { id: Number(groupId) },
  });
  const [addUser] = useAddUserToGroupMutation();
  const [removeUser] = useRemoveUserFromGroupMutation();

  const members = useMemo(() => data?.ecoverse.group.members || [], [data, groupId]);

  const handleAdd = (member: Member) => {
    addUser({
      variables: {
        groupID: Number(groupId),
        userID: Number(member.id),
      },
      refetchQueries: ['groupMembers'],
      awaitRefetchQueries: true,
    });
  };
  const handleRemove = (member: Member) => {
    removeUser({
      variables: {
        groupID: Number(groupId),
        userID: Number(member.id),
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
export default MembersPage;
