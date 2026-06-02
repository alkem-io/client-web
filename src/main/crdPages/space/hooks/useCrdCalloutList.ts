import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import useSpaceTabProvider from '@/domain/space/layout/tabbedLayout/SpaceTabProvider';

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

  return {
    callouts: calloutsSetProvided.callouts ?? [],
    calloutsSetId,
    classificationTagsets,
    canCreateCallout: calloutsSetProvided.canCreateCallout,
    // Reordering callouts requires Update on the calloutsSet (not the callout).
    // Mirrors the legacy `movable` gate in `useCalloutsSet`.
    canReorderCallouts:
      calloutsSetProvided.calloutsSetAuthorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false,
    tabDescription: tabDescription ?? '',
    flowStateForNewCallouts,
    loading: tabLoading || calloutsSetProvided.loading,
    refetchCallouts: calloutsSetProvided.refetchCallouts,
    refetchCallout: calloutsSetProvided.refetchCallout,
  };
}
