import React, { FC } from 'react';
import { PageProps } from '../../../pages';
import { ApplicationRoute } from '../ApplicationRoute';
import { useEcoverseApplicationsQuery } from '../../../components/generated/graphql';
import { useParams } from 'react-router';
import Loading from '../../../components/core/Loading';

interface Params {
  ecoverseId: string;
}

interface Props extends PageProps {}

export const EcoverseApplicationRoute: FC<Props> = ({ paths }) => {
  const { ecoverseId } = useParams<Params>();
  const { data, loading } = useEcoverseApplicationsQuery({ variables: { ecoverseId: ecoverseId } });
  const applications = data?.ecoverse?.community?.applications || [];

  if (loading) {
    return <Loading />;
  }

  return <ApplicationRoute paths={paths} applications={applications} />;
};
