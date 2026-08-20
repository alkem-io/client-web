import { useCalloutsListForFeedQuery } from '@/core/apollo/generated/apollo-hooks';
import { useCalloutsSetAuthorization } from '@/domain/collaboration/calloutsSet/authorization/useCalloutsSetAuthorization';
import { classificationTagsetModelToTagsetArgs } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.utils';
import useSpaceTabProvider from '@/domain/space/layout/tabbedLayout/SpaceTabProvider';

type UseCrdCalloutListParams = {
  tabPosition: number;
  skip?: boolean;
};

/** The feed only needs each callout's id + sort order — every card lazy-fetches
 *  its own content via CalloutDetails on scroll-into-view. */
export type CrdFeedCallout = { id: string; sortOrder: number };

export function useCrdCalloutList({ tabPosition, skip }: UseCrdCalloutListParams) {
  const {
    calloutsSetId,
    classificationTagsets,
    flowStateForNewCallouts,
    tabDescription,
    loading: tabLoading,
  } = useSpaceTabProvider({ tabPosition, skip });

  // Create + reorder privileges both come from the calloutsSet authorization —
  // no need to re-fetch them on the list query.
  const {
    canCreateCallout,
    canMoveCallouts,
    loading: authLoading,
  } = useCalloutsSetAuthorization({ calloutsSetId, skip });

  // Lean list query (feature 007): id + sortOrder only. Replaces the heavy
  // `CalloutsOnCalloutsSetUsingClassification`, whose framing/classification
  // payload is now fetched lazily by the Post Index dialog instead.
  const { data, loading: feedLoading } = useCalloutsListForFeedQuery({
    variables: {
      // biome-ignore lint/style/noNonNullAssertion: ensured by skip
      calloutsSetId: calloutsSetId!,
      classificationTagsets: classificationTagsetModelToTagsetArgs(classificationTagsets),
    },
    fetchPolicy: 'cache-and-network',
    skip: skip || !calloutsSetId,
  });

  const callouts: CrdFeedCallout[] = data?.lookup.calloutsSet?.callouts ?? [];

  return {
    callouts,
    calloutsSetId,
    classificationTagsets,
    canCreateCallout,
    canReorderCallouts: canMoveCallouts,
    tabDescription: tabDescription ?? '',
    flowStateForNewCallouts,
    loading: tabLoading || authLoading || feedLoading,
  };
}
