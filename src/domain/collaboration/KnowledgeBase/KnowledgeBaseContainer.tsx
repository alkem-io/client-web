import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import useCallouts, { UseCalloutsProvided } from '../callout/useCallouts/useCallouts';
import { CalloutGroupName } from '@/core/apollo/generated/graphql-schema';
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
    groupNames: [CalloutGroupName.Knowledge],
  });

  return <>{children({ callouts })}</>;
};

export default KnowledgeBaseContainer;
