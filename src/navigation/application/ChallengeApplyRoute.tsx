import React, { FC } from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import { useChallengeApplicationQuery, useChallengeApplicationTemplateQuery } from '../../generated/graphql';
import ApplyRoute from './ApplyRoute';
import { PageProps } from '../../pages';

interface Params {
  ecoverseId: string;
  id: string;
}

interface Props extends PageProps {}

const ChallengeApplyRoute: FC<Props> = ({ paths }) => {
  const { path } = useRouteMatch();
  const { ecoverseId, id: challengeId } = useParams<Params>();
  const backUrl = `/${ecoverseId}/challenges/${challengeId}`;

  /* todo: only community ID is needed */
  const {
    data: challengeData,
    loading: isCommunityLoading,
    error: communityError,
  } = useChallengeApplicationQuery({
    variables: {
      ecoverseId: ecoverseId,
      challengeId: challengeId,
    },
  });
  const communityId = challengeData?.ecoverse.challenge.community?.id || '';
  const ecoverseName = challengeData?.ecoverse.challenge.displayName || '';
  const avatar = challengeData?.ecoverse.challenge.context?.visual?.avatar || '';
  const tagline = challengeData?.ecoverse.challenge.context?.tagline || '';

  const {
    data: templateData,
    loading: isTemplateLoading,
    error: templateError,
  } = useChallengeApplicationTemplateQuery();
  /* todo: get applications by ecoverse and application name */
  const questions = templateData?.configuration.template.challenges[0].applications?.[0].questions || [];

  return (
    <ApplyRoute
      loading={isCommunityLoading || isTemplateLoading}
      error={!!(communityError || templateError)}
      paths={paths}
      path={path}
      avatar={avatar}
      tagline={tagline}
      communityName={ecoverseName}
      communityId={communityId}
      questions={questions}
      backUrl={backUrl}
    />
  );
};
export default ChallengeApplyRoute;
