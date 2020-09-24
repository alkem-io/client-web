import React, { FC } from 'react';
import { useChallengeListQuery } from '../../generated/graphql';
import ChallengeList, { OwnProps } from './ChallengeList';

const ChallengeListContainer: FC<OwnProps> = props => {
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

  // handleIdChange={() => 2.0}
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <ChallengeList data={data} {...props} />;
};

export default ChallengeListContainer;
