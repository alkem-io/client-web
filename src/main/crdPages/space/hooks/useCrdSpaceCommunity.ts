import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import { useSpace } from '@/domain/space/context/useSpace';
import useSpaceTabProvider from '@/domain/space/layout/tabbedLayout/SpaceTabProvider';

export function useCrdSpaceCommunity() {
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

  const leadUsers = space.about.membership?.leadUsers ?? [];
  const guidelines = space.about.guidelines;

  return {
    callouts: calloutsSetProvided.callouts ?? [],
    calloutsSetId,
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
