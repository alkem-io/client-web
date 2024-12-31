import { UseCalloutsProvided } from '@/domain/collaboration/calloutsSet/useCallouts/useCallouts';
import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import { CalloutGroupName } from '@/core/apollo/generated/graphql-schema';
import useCalloutsOnCollaboration from '@/domain/collaboration/useCalloutsOnCollaboratin';

interface SpaceCommunityContainerProps extends SimpleContainerProps<SpaceCommunityContainerProvided> {
  collaborationId: string | undefined;
}

interface SpaceCommunityContainerProvided {
  callouts: UseCalloutsProvided;
}

const SpaceCommunityContainer = ({ collaborationId, children }: SpaceCommunityContainerProps) => {
  const callouts = useCalloutsOnCollaboration({
    collaborationId,
    groupNames: [CalloutGroupName.Community],
  });

  return <>{children({ callouts })}</>;
};

export default SpaceCommunityContainer;
