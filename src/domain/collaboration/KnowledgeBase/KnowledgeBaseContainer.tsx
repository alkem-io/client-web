import { SimpleContainerProps } from '../../../core/container/SimpleContainer';
import useCallouts, { UseCalloutsProvided } from '../callout/useCallouts/useCallouts';
import { CalloutGroupName } from '../../../core/apollo/generated/graphql-schema';

interface KnowledgeBaseContainerProps
  extends SimpleContainerProps<{
    callouts: UseCalloutsProvided;
  }> {
  spaceNameId: string;
  challengeNameId?: string;
  opportunityNameId?: string;
}

const KnowledgeBaseContainer = ({
  spaceNameId,
  challengeNameId,
  opportunityNameId,
  children,
}: KnowledgeBaseContainerProps) => {
  const callouts = useCallouts({
    spaceNameId,
    challengeNameId,
    opportunityNameId,
    groupNames: [CalloutGroupName.Knowledge],
  });

  return <>{children({ callouts })}</>;
};

export default KnowledgeBaseContainer;
