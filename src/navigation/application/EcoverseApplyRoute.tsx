import React, { FC } from 'react';
import { useParams, useRouteMatch } from 'react-router';
import { useEcoverseApplicationTemplateQuery, useEcoverseCommunityQuery } from '../../generated/graphql';
import { PageProps } from '../../pages';
import ApplyRoute from './ApplyRoute';

interface Props extends PageProps {}

export const EcoverseApplyRoute: FC<Props> = ({ paths }) => {
  const { path } = useRouteMatch();
  const { ecoverseId } = useParams<{ ecoverseId: string }>();
  const backUrl = `/${ecoverseId}`;

  /* todo: only community ID is needed */
  const { data: communityData, loading: isCommunityLoading, error: communityError } = useEcoverseCommunityQuery({
    variables: {
      ecoverseId: ecoverseId,
    },
  });
  const communityId = communityData?.ecoverse.community?.id || '';

  const {
    data: templateData,
    loading: isTemplateLoading,
    error: templateError,
  } = useEcoverseApplicationTemplateQuery();
  /* todo: get applications by ecoverse and application name */
  const questions = templateData?.configuration.template.ecoverses[0].applications?.[0].questions || [];

  return (
    <ApplyRoute
      loading={isCommunityLoading || isTemplateLoading}
      error={!!(communityError || templateError)}
      paths={paths}
      path={path}
      communityId={communityId}
      questions={questions}
      backUrl={backUrl}
    />
  );
};
