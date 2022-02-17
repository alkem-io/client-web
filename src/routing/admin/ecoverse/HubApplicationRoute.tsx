import React, { FC } from 'react';
import { PageProps } from '../../../pages';
import { ApplicationRoute } from '../ApplicationRoute';
import { useHubApplicationsQuery } from '../../../hooks/generated/graphql';
import Loading from '../../../components/core/Loading/Loading';
import { useUrlParams } from '../../../hooks';

interface Props extends PageProps {}

export const HubApplicationRoute: FC<Props> = ({ paths }) => {
  const { hubNameId = '' } = useUrlParams();
  const { data, loading } = useHubApplicationsQuery({
    variables: { hubId: hubNameId },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });
  const applications = data?.hub?.community?.applications || [];

  if (loading) {
    return <Loading />;
  }

  return <ApplicationRoute paths={paths} applications={applications} />;
};
