import { UseCalloutsProvided } from '@/domain/collaboration/calloutsSet/useCallouts/useCallouts';
import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import useCalloutsOnCollaboration from '@/domain/collaboration/useCalloutsOnCollaboration';
import { SpaceTab } from '@/domain/space/SpaceTabs';

interface SpaceCommunityContainerProps extends SimpleContainerProps<SpaceCommunityContainerProvided> {
  collaborationId: string | undefined;
}

interface SpaceCommunityContainerProvided {
  callouts: UseCalloutsProvided;
}

const SpaceCommunityContainer = ({ collaborationId, children }: SpaceCommunityContainerProps) => {
  const callouts = useCalloutsOnCollaboration({
    collaborationId,
    groupNames: [SpaceTab.COMMUNITY],
  });

  return <>{children({ callouts })}</>;
};

export default SpaceCommunityContainer;
