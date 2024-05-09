import { useMemo } from 'react';
import {
  useSpaceApplicationQuery,
  useSpaceApplicationTemplateQuery,
} from '../../../../core/apollo/generated/apollo-hooks';

// can join always false for spaces ???
export const useApplicationCommunityQuery = (journeyId: string | undefined, canJoinCommunity: boolean) => {
  const {
    data: challengeData,
    loading: isChallengeCommunityLoading,
    error: challengeCommunityError,
  } = useSpaceApplicationQuery({
    variables: {
      spaceId: journeyId!,
    },
    errorPolicy: 'all',
    skip: !journeyId || canJoinCommunity,
  });

  const {
    data: challengeTemplateData,
    loading: isChallengeTemplateLoading,
    error: challengeTemplateError,
  } = useSpaceApplicationTemplateQuery({
    variables: {
      spaceId: journeyId!,
    },
    skip: !journeyId || canJoinCommunity,
  });

  const result = useMemo(() => {
    return {
      communityId: challengeData?.space?.community?.id || '',
      displayName: challengeData?.space?.profile.displayName || '',
      description: challengeTemplateData?.space?.community?.applicationForm?.description,
      questions: challengeTemplateData?.space?.community?.applicationForm?.questions ?? [],
      backUrl: challengeData?.space?.profile.url,
      communityGuidelines: challengeData?.space?.community?.guidelines?.profile,
    };
  }, [challengeData, challengeTemplateData]);

  return {
    data: result,
    error: challengeCommunityError ?? challengeTemplateError,
    loading: isChallengeCommunityLoading || isChallengeTemplateLoading,
  };
};
