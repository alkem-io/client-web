import { useMemo } from 'react';
import { useUrlParams } from '../../hooks';
import {
  useChallengeApplicationQuery,
  useChallengeApplicationTemplateQuery,
  useEcoverseApplicationQuery,
  useEcoverseApplicationTemplateQuery,
} from '../../hooks/generated/graphql';
import { ApplicationTypeEnum } from '../../models/enums/application-type';
import { buildChallengeUrl, buildEcoverseUrl } from '../../utils/urlBuilders';
import { getVisualAvatar } from '../../utils/visuals.utils';

export const useApplicationCommunityQuery = (type: ApplicationTypeEnum) => {
  const { ecoverseNameId = '', challengeNameId = '' } = useUrlParams();

  const {
    data: challengeData,
    loading: isChallengeCommunityLoading,
    error: challengeCommunityError,
  } = useChallengeApplicationQuery({
    variables: {
      ecoverseId: ecoverseNameId,
      challengeId: challengeNameId,
    },
    errorPolicy: 'all',
    skip: type !== ApplicationTypeEnum.challenge,
  });

  const {
    data: challengeTemplateData,
    loading: isChallengeTemplateLoading,
    error: challengeTemplateError,
  } = useChallengeApplicationTemplateQuery({
    skip: type !== ApplicationTypeEnum.challenge,
  });

  const {
    data: ecoverseData,
    loading: isEcoverseCommunityLoading,
    error: ecoverseCommunityError,
  } = useEcoverseApplicationQuery({
    variables: {
      ecoverseId: ecoverseNameId,
    },
    errorPolicy: 'all',
    skip: type !== ApplicationTypeEnum.ecoverse,
  });

  const {
    data: ecoverseTemplateData,
    loading: isEcoverseTemplateLoading,
    error: ecoverseTemplateError,
  } = useEcoverseApplicationTemplateQuery({
    skip: type !== ApplicationTypeEnum.ecoverse,
  });

  const result = useMemo(() => {
    if (type === ApplicationTypeEnum.ecoverse) {
      return {
        communityId: ecoverseData?.ecoverse.community?.id || '',
        displayName: ecoverseData?.ecoverse.displayName || '',
        avatar: getVisualAvatar(ecoverseData?.ecoverse.context?.visuals),
        tagline: ecoverseData?.ecoverse.context?.tagline || '',
        questions: ecoverseTemplateData?.configuration.template.ecoverses[0].applications?.[0].questions || [],
        backUrl: buildEcoverseUrl(ecoverseNameId),
      };
    }
    if (type === ApplicationTypeEnum.challenge) {
      return {
        communityId: challengeData?.ecoverse.challenge.community?.id || '',
        displayName: challengeData?.ecoverse.challenge.displayName || '',
        avatar: getVisualAvatar(challengeData?.ecoverse.challenge.context?.visuals),
        tagline: challengeData?.ecoverse.challenge.context?.tagline || '',
        questions: challengeTemplateData?.configuration.template.challenges[0].applications?.[0].questions || [],
        backUrl: buildChallengeUrl(ecoverseNameId, challengeNameId),
      };
    }
  }, [type, challengeData, challengeTemplateData, ecoverseData, ecoverseTemplateData]);

  return {
    data: result,
    error: challengeCommunityError || challengeTemplateError || ecoverseCommunityError || ecoverseTemplateError,
    loading:
      isChallengeCommunityLoading ||
      isChallengeTemplateLoading ||
      isEcoverseCommunityLoading ||
      isEcoverseTemplateLoading,
  };
};
