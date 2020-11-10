import React, { FC } from 'react';
import { useEcoverseListQuery } from '../../generated/graphql';
import EcoverseProfile from './EcoverseProfile';

const EcoverseProfileContainer: FC<Record<string, unknown>> = () => {
  const { data, error, loading } = useEcoverseListQuery();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>ERROR {error.message}</div>;
  }

  if (!data) {
    return <div>NO DATA {data}</div>;
  }

  return <EcoverseProfile data={data} />;
};

export default EcoverseProfileContainer;
