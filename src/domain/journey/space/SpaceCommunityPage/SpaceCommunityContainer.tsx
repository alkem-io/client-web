import useCallouts, { UseCalloutsProvided } from '../../../collaboration/callout/useCallouts/useCallouts';
import { SimpleContainerProps } from '@core/container/SimpleContainer';
import { CalloutGroupName } from '@core/apollo/generated/graphql-schema';

interface SpaceCommunityContainerProps extends SimpleContainerProps<SpaceCommunityContainerProvided> {
  spaceId: string | undefined;
}

interface SpaceCommunityContainerProvided {
  callouts: UseCalloutsProvided;
}

const SpaceCommunityContainer = ({ spaceId, children }: SpaceCommunityContainerProps) => {
  const callouts = useCallouts({
    journeyId: spaceId,
    journeyTypeName: 'space',
    groupNames: [CalloutGroupName.Community],
  });

  return <>{children({ callouts })}</>;
};

export default SpaceCommunityContainer;
