import React, { FC } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useEcoverseChallengeGroupsQuery } from '../../generated/graphql';
import SearchableList from './SearchableList';

export const GroupPage: FC = () => {
  const { data, loading } = useEcoverseChallengeGroupsQuery();
  const { path } = useRouteMatch();

  const groups = ((data && data.groups) || []).map(g => ({ id: g.id, value: g.name }));

  if (loading) {
    return <div>Loading...</div>;
  } else {
    return (
      <>
        <h2 style={{ textAlign: 'center' }}>Groups</h2>
        <hr />
        <SearchableList data={groups} path={`${path}`} />
      </>
    );
  }
};
export default GroupPage;
