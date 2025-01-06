import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import useKnowledgeBase from '@/domain/community/virtualContributor/knowledgeBase/useKnowledgeBase';
import { CalloutGroupName, CalloutType } from '@/core/apollo/generated/graphql-schema';
import { DescriptionComponent } from '@/domain/common/description/DescriptionComponent';

type KnowledgeBase = {
  id: string;
};

const AVAILABLE_CALLOUT_TYPES = [CalloutType.Post, CalloutType.LinkCollection, CalloutType.PostCollection];

/**
 * KnowledgeBase component displays a group of callouts.
 * Currently, used for VC Knowledge but it could be extended with a 'type'.
 */
const KnowledgeBase = ({ id }: KnowledgeBase) => {
  const {
    calloutsSetId,
    callouts,
    canCreateCallout,
    loading,
    onCalloutsSortOrderUpdate,
    refetchCallout,
    knowledgeBaseDescription,
    updateDescription,
  } = useKnowledgeBase({ id });

  return (
    <>
      {(knowledgeBaseDescription || canCreateCallout) && (
        <DescriptionComponent
          description={knowledgeBaseDescription}
          canEdit={canCreateCallout}
          onUpdate={updateDescription}
        />
      )}
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
        availableCalloutTypes={AVAILABLE_CALLOUT_TYPES}
        disableRichMedia
      />
    </>
  );
};

export default KnowledgeBase;
