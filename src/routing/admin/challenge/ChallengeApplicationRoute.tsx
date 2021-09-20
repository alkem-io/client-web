import React, { FC } from 'react';
import { PageProps } from '../../../pages';
import { ApplicationRoute } from '../ApplicationRoute';
import Loading from '../../../components/core/Loading/Loading';
import { useChallengeApplicationsQuery } from '../../../hooks/generated/graphql';
import { useUrlParams } from '../../../hooks';

interface Props extends PageProps {}

export const ChallengeApplicationRoute: FC<Props> = ({ paths }) => {
  const { ecoverseId, challengeId } = useUrlParams();
  const { data, loading } = useChallengeApplicationsQuery({
    variables: { ecoverseId: ecoverseId, challengeId: challengeId },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  const applications = data?.ecoverse?.challenge?.community?.applications || [];

  if (loading) {
    return <Loading />;
  }

  return <ApplicationRoute paths={paths} applications={applications} />;
};
