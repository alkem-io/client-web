import { useMemo } from 'react';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import {
  useChallengeApplicationQuery,
  useChallengeApplicationTemplateQuery,
  useHubApplicationQuery,
  useHubApplicationTemplateQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ApplicationTypeEnum } from '../constants/ApplicationType';
import { buildChallengeUrl, buildHubUrl } from '../../../../common/utils/urlBuilders';

export const useApplicationCommunityQuery = (type: ApplicationTypeEnum) => {
  const { hubNameId = '', challengeNameId = '' } = useUrlParams();

  const {
    data: challengeData,
    loading: isChallengeCommunityLoading,
    error: challengeCommunityError,
  } = useChallengeApplicationQuery({
    variables: {
      hubId: hubNameId,
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
    variables: {
      hubId: hubNameId,
      challengeId: challengeNameId,
    },
  });

  const {
    data: hubData,
    loading: isHubCommunityLoading,
    error: hubCommunityError,
  } = useHubApplicationQuery({
    variables: {
      hubId: hubNameId,
    },
    errorPolicy: 'all',
    skip: type !== ApplicationTypeEnum.hub,
  });

  const {
    data: hubTemplateData,
    loading: isHubTemplateLoading,
    error: hubTemplateError,
  } = useHubApplicationTemplateQuery({
    skip: type !== ApplicationTypeEnum.hub,
    variables: {
      hubId: hubNameId,
    },
  });

  const result = useMemo(() => {
    if (type === ApplicationTypeEnum.hub) {
      return {
        communityId: hubData?.hub.community?.id || '',
        displayName: hubData?.hub.profile.displayName || '',
        description: hubTemplateData?.hub.community?.applicationForm?.description,
        questions: hubTemplateData?.hub.community?.applicationForm?.questions || [],
        backUrl: buildHubUrl(hubNameId),
      };
    }
    if (type === ApplicationTypeEnum.challenge) {
      return {
        communityId: challengeData?.hub.challenge.community?.id || '',
        displayName: challengeData?.hub.challenge.profile.displayName || '',
        description: challengeTemplateData?.hub.challenge.community?.applicationForm?.description,
        questions: challengeTemplateData?.hub.challenge.community?.applicationForm?.questions || [],
        backUrl: buildChallengeUrl(hubNameId, challengeNameId),
      };
    }
  }, [type, challengeData, challengeTemplateData, hubData, hubTemplateData, challengeNameId, hubNameId]);

  return {
    data: result,
    error: challengeCommunityError || challengeTemplateError || hubCommunityError || hubTemplateError,
    loading: isChallengeCommunityLoading || isChallengeTemplateLoading || isHubCommunityLoading || isHubTemplateLoading,
  };
};
