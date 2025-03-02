import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import { UseCalloutsProvided } from '../calloutsSet/useCallouts/useCallouts';
import useCalloutsOnCollaboration from '../useCalloutsOnCollaboration';
import { SpaceTab } from '@/domain/space/SpaceTabs';

interface KnowledgeBaseContainerProps
  extends SimpleContainerProps<{
    callouts: UseCalloutsProvided;
  }> {
  collaborationId: string | undefined;
}

const KnowledgeBaseContainer = ({ collaborationId, children }: KnowledgeBaseContainerProps) => {
  const callouts = useCalloutsOnCollaboration({
    collaborationId,
    groupNames: [SpaceTab.KNOWLEDGE],
  });

  return <>{children({ callouts })}</>;
};

export default KnowledgeBaseContainer;
