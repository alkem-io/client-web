import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useGroupMembersQuery } from '../../generated/graphql';
import SearchableList from './SearchableList';

interface Parameters {
  groupId: string;
}

export const GroupEdit: FC = () => {
  const { groupId } = useParams<Parameters>();
  const { data, loading } = useGroupMembersQuery({ variables: { id: Number(groupId) } });

  let members: { id: number | string; value: string }[] = [];
  if (data && data.group && data.group.members) {
    members =
      data.group.members.map(x => ({
        id: x.email,
        value: `${x.name} (${x.email})`,
      })) || [];
  }

  if (loading) return <div>Loading...</div>;

  return <SearchableList data={members} url={''} />;
};

export default GroupEdit;
