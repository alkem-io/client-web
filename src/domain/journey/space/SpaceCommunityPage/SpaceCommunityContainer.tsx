import useCallouts, { UseCalloutsProvided } from '../../../collaboration/callout/useCallouts/useCallouts';
import { SimpleContainerProps } from '../../../../core/container/SimpleContainer';
import { CalloutGroupName } from '../../../../core/apollo/generated/graphql-schema';

interface SpaceCommunityContainerProps extends SimpleContainerProps<SpaceCommunityContainerProvided> {
  collaborationId: string | undefined;
}

interface SpaceCommunityContainerProvided {
  callouts: UseCalloutsProvided;
}

const SpaceCommunityContainer = ({ collaborationId, children }: SpaceCommunityContainerProps) => {
  const callouts = useCallouts({
    collaborationId,
    journeyTypeName: 'space',
    canReadCollaboration: true,
    groupNames: [CalloutGroupName.Community],
  });

  return <>{children({ callouts })}</>;
};

export default SpaceCommunityContainer;
