import { useMemo } from 'react';
import { useSpaceApplicationQuery, useSpaceApplicationTemplateQuery } from '@/core/apollo/generated/apollo-hooks';

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
      communityId: challengeData?.lookup.space?.community?.id ?? '',
      roleSetId: challengeData?.lookup.space?.community?.roleSet?.id ?? '',
      displayName: challengeData?.lookup.space?.about.profile.displayName ?? '',
      description: challengeTemplateData?.lookup.space?.community?.roleSet.applicationForm?.description,
      questions: challengeTemplateData?.lookup.space?.community?.roleSet.applicationForm?.questions ?? [],
      backUrl: challengeData?.lookup.space?.about.profile.url,
      communityGuidelines: challengeData?.lookup.space?.community?.guidelines?.profile,
    };
  }, [challengeData, challengeTemplateData]);

  return {
    data: result,
    error: challengeCommunityError ?? challengeTemplateError,
    loading: isChallengeCommunityLoading || isChallengeTemplateLoading,
  };
};
