import { SimpleContainerProps } from '../../../core/container/SimpleContainer';
import useCallouts, { UseCalloutsProvided } from '../callout/useCallouts/useCallouts';
import { CalloutDisplayLocation } from '../../../core/apollo/generated/graphql-schema';
import { JourneyTypeName } from '../../journey/JourneyTypeName';

interface KnowledgeBaseContainerProps
  extends SimpleContainerProps<{
    callouts: UseCalloutsProvided;
  }> {
  journeyId: string | undefined;
  journeyTypeName: JourneyTypeName;
}

const KnowledgeBaseContainer = ({ journeyId, journeyTypeName, children }: KnowledgeBaseContainerProps) => {
  const callouts = useCallouts({
    journeyId,
    journeyTypeName,
    displayLocations: [CalloutDisplayLocation.Knowledge],
  });

  return <>{children({ callouts })}</>;
};

export default KnowledgeBaseContainer;
