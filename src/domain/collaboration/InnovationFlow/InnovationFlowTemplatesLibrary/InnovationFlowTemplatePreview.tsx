import { FC } from 'react';
import InnovationFlowVisualizer from '../../../platform/admin/templates/InnovationTemplates/InnovationFlowVisualizer';
import { Box, CircularProgress } from '@mui/material';
import { Identifiable } from '../../../../core/utils/Identifiable';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { useInnovationFlowTemplateStatesQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { InnovationFlowState } from '../InnovationFlow';

interface InnovationFlowTemplatePreviewProps {
  template?: Identifiable;
}

const InnovationFlowTemplatePreview: FC<InnovationFlowTemplatePreviewProps> = ({ template }) => {
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
      <InnovationFlowVisualizer states={templateStates} />
    </PageContentBlock>
  );
};

export default InnovationFlowTemplatePreview;
