import type { PostCardData } from '@/crd/components/space/PostCard';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import useSpaceTabProvider from '@/domain/space/layout/tabbedLayout/SpaceTabProvider';
import { mapCalloutsToPostCards } from '../dataMappers/calloutDataMapper';

type UseCrdCalloutListParams = {
  tabPosition: number;
  tagsFilter?: string[];
  skip?: boolean;
};

export function useCrdCalloutList({ tabPosition, tagsFilter, skip }: UseCrdCalloutListParams) {
  const {
    calloutsSetId,
    classificationTagsets,
    flowStateForNewCallouts,
    tabDescription,
    loading: tabLoading,
  } = useSpaceTabProvider({ tabPosition, skip });

  const calloutsSetProvided = useCalloutsSet({
    calloutsSetId,
    classificationTagsets,
    tagsFilter,
    skip,
  });

  const posts: PostCardData[] = calloutsSetProvided.callouts
    ? mapCalloutsToPostCards(calloutsSetProvided.callouts)
    : [];

  return {
    posts,
    canCreateCallout: calloutsSetProvided.canCreateCallout,
    tabDescription: tabDescription ?? '',
    flowStateForNewCallouts,
    loading: tabLoading || calloutsSetProvided.loading,
    refetchCallouts: calloutsSetProvided.refetchCallouts,
    refetchCallout: calloutsSetProvided.refetchCallout,
  };
}
