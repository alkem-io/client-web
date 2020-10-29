import React, { FC, useMemo } from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import { EcoverseChallengeGroupsQuery } from '../../generated/graphql';
import { mapGroups } from '../../utils';
import SearchableList from './SearchableList';

interface Parameters {
  challengeId: string;
}

interface GroupListProps {
  data: EcoverseChallengeGroupsQuery | undefined;
  type: 'challenge' | 'ecoverse';
}

export const GroupList: FC<GroupListProps> = ({ data, type }) => {
  const { url } = useRouteMatch();
  const { challengeId } = useParams<Parameters>();

  const groups = useMemo(() => {
    let groups: { id: number | string; value: string }[] = [];
    if (data) {
      if (type === 'challenge') {
        const challenge = data?.challenges.find(c => c.textID === challengeId);
        if (challenge && challenge.groups) {
          groups = challenge.groups?.map(mapGroups);
        }
      } else if (type === 'ecoverse') {
        groups = data?.groups.map(mapGroups);
      }
    }
    return groups;
  }, [challengeId, data, type]);

  const name = useMemo(() => {
    if (type === 'ecoverse') return 'Ecoverse';
    const challenge = data?.challenges.find(c => c.textID === challengeId);
    return `${challenge?.name} (challenge)`;
  }, [data, type]);

  return (
    <>
      <h3>{name}</h3>
      <SearchableList data={groups} url={url} />
    </>
  );
};
export default GroupList;
