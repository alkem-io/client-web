import { FC } from 'react';
import { TemplateBase, TemplatePreviewBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { SafeInnovationFlowVisualizer } from '../../../platform/admin/templates/InnovationTemplates/SafeInnovationFlowVisualizer';
import { useInnovationFlowTemplateDefinitionQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { Box, CircularProgress } from '@mui/material';
import { Identifiable } from '../../../../core/utils/Identifiable';

interface InnovationFlowTemplatePreviewProps extends TemplatePreviewBaseProps<TemplateBase & Identifiable> {}

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
