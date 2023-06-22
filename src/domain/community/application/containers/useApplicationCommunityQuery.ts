import { useMemo } from 'react';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import {
  useChallengeApplicationQuery,
  useChallengeApplicationTemplateQuery,
  useSpaceApplicationQuery,
  useSpaceApplicationTemplateQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ApplicationTypeEnum } from '../constants/ApplicationType';
import { buildChallengeUrl, buildSpaceUrl } from '../../../../common/utils/urlBuilders';

export const useApplicationCommunityQuery = (type: ApplicationTypeEnum) => {
  const { spaceNameId = '', challengeNameId = '' } = useUrlParams();

  const {
    data: challengeData,
    loading: isChallengeCommunityLoading,
    error: challengeCommunityError,
  } = useChallengeApplicationQuery({
    variables: {
      spaceId: spaceNameId,
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
      spaceId: spaceNameId,
      challengeId: challengeNameId,
    },
  });

  const {
    data: spaceData,
    loading: isSpaceCommunityLoading,
    error: spaceCommunityError,
  } = useSpaceApplicationQuery({
    variables: {
      spaceId: spaceNameId,
    },
    errorPolicy: 'all',
    skip: type !== ApplicationTypeEnum.space,
  });

  const {
    data: spaceTemplateData,
    loading: isSpaceTemplateLoading,
    error: spaceTemplateError,
  } = useSpaceApplicationTemplateQuery({
    skip: type !== ApplicationTypeEnum.space,
    variables: {
      spaceId: spaceNameId,
    },
  });

  const result = useMemo(() => {
    if (type === ApplicationTypeEnum.space) {
      return {
        communityId: spaceData?.space.community?.id || '',
        displayName: spaceData?.space.profile.displayName || '',
        description: spaceTemplateData?.space.community?.applicationForm?.description,
        questions: spaceTemplateData?.space.community?.applicationForm?.questions || [],
        backUrl: buildSpaceUrl(spaceNameId),
      };
    }
    if (type === ApplicationTypeEnum.challenge) {
      return {
        communityId: challengeData?.space.challenge.community?.id || '',
        displayName: challengeData?.space.challenge.profile.displayName || '',
        description: challengeTemplateData?.space.challenge.community?.applicationForm?.description,
        questions: challengeTemplateData?.space.challenge.community?.applicationForm?.questions || [],
        backUrl: buildChallengeUrl(spaceNameId, challengeNameId),
      };
    }
  }, [type, challengeData, challengeTemplateData, spaceData, spaceTemplateData, challengeNameId, spaceNameId]);

  return {
    data: result,
    error: challengeCommunityError || challengeTemplateError || spaceCommunityError || spaceTemplateError,
    loading:
      isChallengeCommunityLoading || isChallengeTemplateLoading || isSpaceCommunityLoading || isSpaceTemplateLoading,
  };
};
