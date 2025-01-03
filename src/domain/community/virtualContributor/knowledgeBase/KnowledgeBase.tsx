import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import useKnowledgeBase from '@/domain/community/virtualContributor/knowledgeBase/useKnowledgeBase';
import { CalloutGroupName } from '@/core/apollo/generated/graphql-schema';

type KnowledgeBase = {
  id: string;
};

/**
 * KnowledgeBase component displays a group of callouts.
 * Currently, used for VC Knowledge but it could be extended with a 'type'.
 */
const KnowledgeBase = ({ id }: KnowledgeBase) => {
  const { calloutsSetId, callouts, canCreateCallout, loading, onCalloutsSortOrderUpdate, refetchCallout } =
    useKnowledgeBase({ id });

  return (
    <CalloutsGroupView
      journeyId={''}
      calloutsSetId={calloutsSetId}
      callouts={callouts}
      canCreateCallout={canCreateCallout}
      loading={loading}
      journeyTypeName="space"
      onSortOrderUpdate={onCalloutsSortOrderUpdate}
      onCalloutUpdate={refetchCallout}
      groupName={CalloutGroupName.Knowledge}
      createButtonPlace="top"
    />
  );
};

export default KnowledgeBase;
