import React, { FC } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useChallengeApplicationQuery, useChallengeApplicationTemplateQuery } from '../../hooks/generated/graphql';
import ApplyRoute from './ApplyRoute';
import { PageProps } from '../../pages';
import { useUrlParams } from '../../hooks';
import { buildChallengeUrl } from '../../utils/urlBuilders';

interface Props extends PageProps {}

const ChallengeApplyRoute: FC<Props> = ({ paths }) => {
  const { path } = useRouteMatch();
  const { ecoverseId, challengeId } = useUrlParams();
  const backUrl = buildChallengeUrl(ecoverseId, challengeId);

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
    errorPolicy: 'all',
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
      type={'challenge'}
    />
  );
};
export default ChallengeApplyRoute;
