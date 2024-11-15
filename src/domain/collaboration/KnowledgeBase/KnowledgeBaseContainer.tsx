import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import useCallouts, { UseCalloutsProvided } from '../callout/useCallouts/useCallouts';
import { CalloutGroupName } from '@/core/apollo/generated/graphql-schema';
import { JourneyTypeName } from '../../journey/JourneyTypeName';

interface KnowledgeBaseContainerProps
  extends SimpleContainerProps<{
    callouts: UseCalloutsProvided;
  }> {
  collaborationId: string | undefined;
  journeyTypeName: JourneyTypeName;
}

const KnowledgeBaseContainer = ({ collaborationId, journeyTypeName, children }: KnowledgeBaseContainerProps) => {
  const callouts = useCallouts({
    collaborationId,
    journeyTypeName,
    canReadCollaboration: true,
    groupNames: [CalloutGroupName.Knowledge],
  });

  return <>{children({ callouts })}</>;
};

export default KnowledgeBaseContainer;
