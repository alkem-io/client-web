import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import Loading from '@/core/ui/loading/Loading';
import { InnovationFlowStateModel } from '@/domain/collaboration/InnovationFlow/models/InnovationFlowState';
import InnovationFlowChips from '@/domain/collaboration/InnovationFlow/InnovationFlowVisualizers/InnovationFlowChips';
import InnovationFlowCalloutsPreview, {
  InnovationFlowCalloutsPreviewProps,
} from '../../../collaboration/callout/CalloutsPreview/InnovationFlowCalloutsPreview';

interface CollaborationTemplatePreviewProps {
  loading?: boolean;
  template?: {
    collaboration?: {
      innovationFlow?: {
        states: InnovationFlowStateModel[];
      };
      calloutsSet?: {
        callouts?: InnovationFlowCalloutsPreviewProps['callouts'];
      };
    };
  };
}

const CollaborationTemplatePreview = ({ template, loading }: CollaborationTemplatePreviewProps) => {
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);
  const templateStates = template?.collaboration?.innovationFlow?.states ?? [];
  const callouts = template?.collaboration?.calloutsSet?.callouts ?? [];

  useEffect(() => {
    if (
      templateStates &&
      templateStates.length > 0 &&
      selectedState &&
      !templateStates.map(state => state.displayName).includes(selectedState)
    ) {
      setSelectedState(templateStates[0]?.displayName);
    }
  }, [selectedState, templateStates]);

  useEffect(() => {
    if (!selectedState && templateStates.length > 0) {
      setSelectedState(templateStates[0]?.displayName);
    }
  }, [selectedState, templateStates]);

  return (
    <PageContentBlock>
      {loading && (
        <Box textAlign="center">
          <Loading />
        </Box>
      )}
      {!loading && (
        <InnovationFlowChips
          states={templateStates}
          selectedState={selectedState}
          onSelectState={state => setSelectedState(state.displayName)}
        />
      )}
      <InnovationFlowCalloutsPreview callouts={callouts} selectedState={selectedState} loading={loading} />
    </PageContentBlock>
  );
};

export default CollaborationTemplatePreview;
