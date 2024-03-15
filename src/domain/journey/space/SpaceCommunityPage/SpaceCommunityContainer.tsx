import useCallouts, { UseCalloutsProvided } from '../../../collaboration/callout/useCallouts/useCallouts';
import { SimpleContainerProps } from '../../../../core/container/SimpleContainer';
import { CalloutGroupName } from '../../../../core/apollo/generated/graphql-schema';

interface SpaceCommunityContainerProps extends SimpleContainerProps<SpaceCommunityContainerProvided> {
  spaceNameId: string;
}

interface SpaceCommunityContainerProvided {
  callouts: UseCalloutsProvided;
}

const SpaceCommunityContainer = ({ spaceNameId, children }: SpaceCommunityContainerProps) => {
  const callouts = useCallouts({
    spaceNameId,
    groupNames: [CalloutGroupName.CommunityLeft, CalloutGroupName.CommunityRight],
  });

  return <>{children({ callouts })}</>;
};

export default SpaceCommunityContainer;
