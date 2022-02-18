import React, { FC } from 'react';
import { PageProps } from '../../../pages';
import { ApplicationRoute } from '../ApplicationRoute';
import Loading from '../../../components/core/Loading/Loading';
import { useChallengeApplicationsQuery } from '../../../hooks/generated/graphql';
import { useUrlParams } from '../../../hooks';

interface Props extends PageProps {}

export const ChallengeApplicationRoute: FC<Props> = ({ paths }) => {
  const { hubNameId = '', challengeNameId = '' } = useUrlParams();
  const { data, loading } = useChallengeApplicationsQuery({
    variables: { hubId: hubNameId, challengeId: challengeNameId },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const applications = data?.hub?.challenge?.community?.applications || [];

  if (loading) {
    return <Loading />;
  }

  return <ApplicationRoute paths={paths} applications={applications} />;
};
