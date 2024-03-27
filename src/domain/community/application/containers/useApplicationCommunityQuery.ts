import { useMemo } from 'react';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import {
  useChallengeApplicationQuery,
  useChallengeApplicationTemplateQuery,
  useSpaceApplicationQuery,
  useSpaceApplicationTemplateQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';

export const useApplicationCommunityQuery = (type: JourneyTypeName, canJoinCommunity: boolean) => {
  const { spaceNameId = '', challengeNameId = '' } = useUrlParams();

  const { challengeId } = useRouteResolver();

  const {
    data: challengeData,
    loading: isChallengeCommunityLoading,
    error: challengeCommunityError,
  } = useChallengeApplicationQuery({
    variables: {
      challengeId: challengeId!,
    },
    errorPolicy: 'all',
    skip: type !== 'challenge' || !challengeId || canJoinCommunity,
  });

  const {
    data: challengeTemplateData,
    loading: isChallengeTemplateLoading,
    error: challengeTemplateError,
  } = useChallengeApplicationTemplateQuery({
    variables: {
      challengeId: challengeId!,
    },
    skip: type !== 'challenge' || !challengeId || canJoinCommunity,
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
    skip: type !== 'space' || canJoinCommunity,
  });

  const {
    data: spaceTemplateData,
    loading: isSpaceTemplateLoading,
    error: spaceTemplateError,
  } = useSpaceApplicationTemplateQuery({
    skip: type !== 'space' || canJoinCommunity,
    variables: {
      spaceId: spaceNameId,
    },
  });

  const result = useMemo(() => {
    if (type === 'space') {
      return {
        communityId: spaceData?.space.community?.id || '',
        displayName: spaceData?.space.profile.displayName || '',
        description: spaceTemplateData?.space.community?.applicationForm?.description,
        questions: spaceTemplateData?.space.community?.applicationForm?.questions || [],
        backUrl: spaceData?.space.profile.url,
        communityGuidelines: spaceData?.space.community?.guidelines?.profile,
      };
    }
    if (type === 'challenge') {
      return {
        communityId: challengeData?.lookup.challenge?.community?.id || '',
        displayName: challengeData?.lookup.challenge?.profile.displayName || '',
        description: challengeTemplateData?.lookup.challenge?.community?.applicationForm?.description,
        questions: challengeTemplateData?.lookup.challenge?.community?.applicationForm?.questions ?? [],
        backUrl: challengeData?.lookup.challenge?.profile.url,
        communityGuidelines: challengeData?.lookup.challenge?.community?.guidelines?.profile,
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
