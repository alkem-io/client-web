import React, { FC } from 'react';
import { PageProps } from '../../../pages';
import { ApplicationRoute } from '../ApplicationRoute';
import { useEcoverseApplicationsQuery } from '../../../hooks/generated/graphql';
import Loading from '../../../components/core/Loading/Loading';
import { useUrlParams } from '../../../hooks';

interface Props extends PageProps {}

export const EcoverseApplicationRoute: FC<Props> = ({ paths }) => {
  const { ecoverseNameId } = useUrlParams();
  const { data, loading } = useEcoverseApplicationsQuery({
    variables: { ecoverseId: ecoverseNameId },
    fetchPolicy: 'cache-and-network',
  });
  const applications = data?.ecoverse?.community?.applications || [];

  if (loading) {
    return <Loading />;
  }

  return <ApplicationRoute paths={paths} applications={applications} />;
};
