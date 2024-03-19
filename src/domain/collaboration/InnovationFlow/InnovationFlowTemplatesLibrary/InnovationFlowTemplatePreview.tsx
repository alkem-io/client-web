import { FC, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Identifiable } from '../../../../core/utils/Identifiable';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { useInnovationFlowTemplateStatesQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { InnovationFlowState } from '../InnovationFlow';
import InnovationFlowChips from '../InnovationFlowChips/InnovationFlowChips';

interface InnovationFlowTemplatePreviewProps {
  template?: Identifiable;
}

const InnovationFlowTemplatePreview: FC<InnovationFlowTemplatePreviewProps> = ({ template }) => {
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);
  const { data, loading } = useInnovationFlowTemplateStatesQuery({
    variables: {
      innovationFlowTemplateId: template?.id!,
    },
    skip: !template?.id,
  });

  const templateStates: InnovationFlowState[] = data?.lookup.innovationFlowTemplate?.states ?? [];

  if (loading || templateStates.length === 0) {
    return (
      <Box textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageContentBlock>
      <InnovationFlowChips
        states={templateStates}
        selectedState={selectedState}
        onSelectState={state => setSelectedState(state.displayName)}
      />
    </PageContentBlock>
  );
};

export default InnovationFlowTemplatePreview;
