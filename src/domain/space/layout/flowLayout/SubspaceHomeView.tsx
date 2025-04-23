import { useContext } from 'react';
import { Theme, useMediaQuery } from '@mui/material';
import { TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import { ClassificationTagsetModel } from '@/domain/collaboration/calloutsSet/ClassificationTagset.model';
import { InnovationFlowStateContext } from '../../routing/SubspaceRoutes';

interface SubspaceHomeViewProps {
  calloutsSetId: string | undefined;
  loading: boolean;
}

const SubspaceHomeView = ({ calloutsSetId, loading }: SubspaceHomeViewProps) => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const { selectedInnovationFlowState } = useContext(InnovationFlowStateContext);
  let classificationTagsets: ClassificationTagsetModel[] = [];
  if (selectedInnovationFlowState) {
    classificationTagsets = [
      {
        name: TagsetReservedName.FlowState,
        tags: [selectedInnovationFlowState],
      },
    ];
  }

  const calloutsSetProvided = useCalloutsSet({
    calloutsSetId,
    classificationTagsets: classificationTagsets,
    includeClassification: true,
    skip: !selectedInnovationFlowState,
  });

  return (
    <CalloutsGroupView
      calloutsSetId={calloutsSetId}
      callouts={calloutsSetProvided.callouts}
      canCreateCallout={calloutsSetProvided.canCreateCallout && isMobile}
      loading={loading}
      onSortOrderUpdate={calloutsSetProvided.onCalloutsSortOrderUpdate}
      onCalloutUpdate={calloutsSetProvided.refetchCallout}
      createButtonPlace="top"
      createInFlowState={selectedInnovationFlowState}
    />
  );
};

export default SubspaceHomeView;
