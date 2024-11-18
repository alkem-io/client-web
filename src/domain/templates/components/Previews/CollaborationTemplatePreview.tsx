import { Box } from '@mui/material';
import { FC, useState } from 'react';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import Loading from '@/core/ui/loading/Loading';
import { InnovationFlowState } from '../../../collaboration/InnovationFlow/InnovationFlow';
import InnovationFlowChips from '../../../collaboration/InnovationFlow/InnovationFlowVisualizers/InnovationFlowChips';

interface CollaborationTemplatePreviewProps {
  loading?: boolean;
  template?: {
    collaboration?: {
      innovationFlow?: {
        states: InnovationFlowState[];
      };
    };
  };
}

const CollaborationTemplatePreview: FC<CollaborationTemplatePreviewProps> = ({ template, loading }) => {
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);
  const templateStates = template?.collaboration?.innovationFlow?.states ?? [];

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
    </PageContentBlock>
  );
};

export default CollaborationTemplatePreview;
