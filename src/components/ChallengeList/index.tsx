import * as React from 'react';
import { useChallengeListQuery } from '../../generated/graphql';
import  ChallengeList, { OwnProps }  from './ChallengeList';

const ChallengeListContainer = (props: OwnProps) => {
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

  //handleIdChange={() => 2.0}
  return <ChallengeList data={data} {...props} />;
};

export default ChallengeListContainer;