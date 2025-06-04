import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import Loading from '@/core/ui/loading/Loading';
import InnovationFlowChips from '@/domain/collaboration/InnovationFlow/InnovationFlowVisualizers/InnovationFlowChips';
import InnovationFlowCalloutsPreview from '../../collaboration/InnovationFlow/InnovationFlowCalloutsPreview';
import { TemplateContentSpaceModel } from './model/TemplateContentSpaceModel';

interface TemplateContentSpacePreviewProps {
  loading?: boolean;
  contentSpace?: TemplateContentSpaceModel;
}

const TemplateContentSpacePreview = ({ contentSpace, loading }: TemplateContentSpacePreviewProps) => {
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);
  const collaboration = contentSpace?.collaboration;
  const templateStates = collaboration?.innovationFlow?.states ?? [];
  const callouts = collaboration?.calloutsSet?.callouts ?? [];

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

export default TemplateContentSpacePreview;
