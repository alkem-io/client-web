import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import { UseCalloutsProvided } from '../calloutsSet/useCallouts/useCallouts';
import useCalloutsOnCollaboration from '../useCalloutsOnCollaboration';

interface KnowledgeBaseContainerProps
  extends SimpleContainerProps<{
    callouts: UseCalloutsProvided;
  }> {
  collaborationId: string | undefined;
}

const KnowledgeBaseContainer = ({ collaborationId, children }: KnowledgeBaseContainerProps) => {
  const callouts = useCalloutsOnCollaboration({
    collaborationId,
    groupNames: [CalloutGroupName.Knowledge],
  });

  return <>{children({ callouts })}</>;
};

export default KnowledgeBaseContainer;
