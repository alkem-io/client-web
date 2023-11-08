import { FC } from 'react';
import { SafeInnovationFlowVisualizer } from '../../../platform/admin/templates/InnovationTemplates/SafeInnovationFlowVisualizer';
import { useInnovationFlowTemplateDefinitionQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { Box, CircularProgress } from '@mui/material';
import { Identifiable } from '../../../../core/utils/Identifiable';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';

interface InnovationFlowTemplatePreviewProps {
  template?: Identifiable;
}

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
  }

  return (
    <PageContentBlock>
      <SafeInnovationFlowVisualizer definition={templateDefinition} />
    </PageContentBlock>
  );
};

export default InnovationFlowTemplatePreview;
