import React, { FC } from 'react';
import { PageProps } from '../../../pages';
import { ApplicationRoute } from '../ApplicationRoute';
import Loading from '../../../components/core/Loading';
import { useChallengeApplicationsQuery } from '../../../hooks/generated/graphql';
import { useParams } from 'react-router';

interface Params {
  ecoverseId: string;
  challengeId: string;
}

interface Props extends PageProps {}

export const ChallengeApplicationRoute: FC<Props> = ({ paths }) => {
  const { ecoverseId, challengeId } = useParams<Params>();
  const { data, loading } = useChallengeApplicationsQuery({
    variables: { ecoverseId: ecoverseId, challengeId: challengeId },
  });

  const applications = data?.ecoverse?.challenge?.community?.applications || [];

  if (loading) {
    return <Loading />;
  }

  return <ApplicationRoute paths={paths} applications={applications} />;
};
