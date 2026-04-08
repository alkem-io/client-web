import type { PostCardData } from '@/crd/components/space/PostCard';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import { useSpace } from '@/domain/space/context/useSpace';
import useSpaceTabProvider from '@/domain/space/layout/tabbedLayout/SpaceTabProvider';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { mapCalloutsToPostCards } from '../dataMappers/calloutDataMapper';

export function useCrdSpaceCommunity() {
  const { spaceId } = useUrlResolver();
  const { space, permissions } = useSpace();

  const {
    calloutsSetId,
    classificationTagsets,
    tabDescription,
    loading: tabLoading,
  } = useSpaceTabProvider({ tabPosition: 1 });

  const calloutsSetProvided = useCalloutsSet({
    calloutsSetId,
    classificationTagsets,
  });

  const posts: PostCardData[] = calloutsSetProvided.callouts
    ? mapCalloutsToPostCards(calloutsSetProvided.callouts as any)
    : [];

  // Extract lead and guideline data from space context
  const leadUsers = space.about.membership?.leadUsers ?? [];
  const guidelines = space.about.guidelines;

  return {
    posts,
    canCreateCallout: calloutsSetProvided.canCreateCallout,
    tabDescription: tabDescription ?? '',
    leadUsers,
    guidelines,
    roleSetId: space.about.membership?.roleSetID,
    communityId: space.about.membership?.communityID,
    canInvite: permissions.canUpdate,
    loading: tabLoading || calloutsSetProvided.loading,
  };
}
