import React, { FC } from 'react';
import { PageProps } from '../../../pages';
import { ApplicationRoute } from '../ApplicationRoute';
import Loading from '../../../components/core/Loading/Loading';
import { useChallengeApplicationsQuery } from '../../../hooks/generated/graphql';
import { useUrlParams } from '../../../hooks';

interface Props extends PageProps {}

export const ChallengeApplicationRoute: FC<Props> = ({ paths }) => {
  const { ecoverseNameId = '', challengeNameId = '' } = useUrlParams();
  const { data, loading } = useChallengeApplicationsQuery({
    variables: { ecoverseId: ecoverseNameId, challengeId: challengeNameId },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const applications = data?.ecoverse?.challenge?.community?.applications || [];

  if (loading) {
    return <Loading />;
  }

  return <ApplicationRoute paths={paths} applications={applications} />;
};
