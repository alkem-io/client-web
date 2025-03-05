import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import { UseCalloutsProvided } from '../../../../../collaboration/calloutsSet/useCallouts/useCallouts';
import useCalloutsOnCollaboration from '../../../../../collaboration/useCalloutsOnCollaboration';
import { SpaceTab } from '@/domain/space/layout/TabbedSpaceL0/SpaceTabs';

interface KnowledgeBaseContainerProps
  extends SimpleContainerProps<{
    callouts: UseCalloutsProvided;
  }> {
  collaborationId: string | undefined;
}

const KnowledgeBaseContainer = ({ collaborationId, children }: KnowledgeBaseContainerProps) => {
  const callouts = useCalloutsOnCollaboration({
    collaborationId,
    flowStateNames: [SpaceTab.KNOWLEDGE],
  });

  return <>{children({ callouts })}</>;
};

export default KnowledgeBaseContainer;
