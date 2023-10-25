import { FC } from 'react';
import { TemplatePreviewBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { InnovationFlowTemplate } from '../InnovationFlowTemplateCard/InnovationFlowTemplate';
import { SafeInnovationFlowVisualizer } from '../../../platform/admin/templates/InnovationTemplates/SafeInnovationFlowVisualizer';
import { useInnovationFlowTemplateDefinitionQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { Box, CircularProgress } from '@mui/material';

interface InnovationFlowTemplatePreviewProps extends TemplatePreviewBaseProps<InnovationFlowTemplate> {}

const InnovationFlowTemplatePreview: FC<InnovationFlowTemplatePreviewProps> = ({ template }) => {
  const { data, loading } = useInnovationFlowTemplateDefinitionQuery({
    variables: {
      innovationFlowTemplateID: template?.id!,
    },
    skip: !template?.id,
  });

  const templateDefinition = data?.lookup.innovationFlowTemplate?.definition;
  if (loading || !templateDefinition) {
    return (
      <Box textAlign="center">
        <CircularProgress />
      </Box>
    );
  } else {
    return <SafeInnovationFlowVisualizer definition={templateDefinition} />;
  }
};

export default InnovationFlowTemplatePreview;
