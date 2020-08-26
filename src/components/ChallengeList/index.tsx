import * as React from 'react';
import { useChallengeListQuery } from '../../generated/graphql';
import  ChallengeList  from './ChallengeList';

const ChallengeListContainer = () => {
  const { data, error, loading } = useChallengeListQuery();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>ERROR {error.message}</div>;
  }

  if (!data) {
    return <div>NO DATA {data}</div>;
  }

  return <ChallengeList data={data} />;
};

export default ChallengeListContainer;