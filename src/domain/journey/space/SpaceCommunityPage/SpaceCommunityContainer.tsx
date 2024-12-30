import useCallouts, { UseCalloutsProvided } from '@/domain/collaboration/calloutsSet/useCallouts/useCallouts';
import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import { CalloutGroupName } from '@/core/apollo/generated/graphql-schema';

interface SpaceCommunityContainerProps extends SimpleContainerProps<SpaceCommunityContainerProvided> {
  collaborationId: string | undefined;
  calloutsSetId: string | undefined;
}

interface SpaceCommunityContainerProvided {
  callouts: UseCalloutsProvided;
}

const SpaceCommunityContainer = ({ collaborationId, calloutsSetId, children }: SpaceCommunityContainerProps) => {
  const callouts = useCallouts({
    collaborationId,
    calloutsSetId,
    journeyTypeName: 'space',
    canReadCollaboration: true,
    groupNames: [CalloutGroupName.Community],
  });

  return <>{children({ callouts })}</>;
};

export default SpaceCommunityContainer;
