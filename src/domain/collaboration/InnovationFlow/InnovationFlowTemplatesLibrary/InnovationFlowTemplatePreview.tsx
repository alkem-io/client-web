import { FC } from 'react';
import { SafeInnovationFlowVisualizer } from '../../../platform/admin/templates/InnovationTemplates/SafeInnovationFlowVisualizer';
import { Box, CircularProgress } from '@mui/material';
import { Identifiable } from '../../../../core/utils/Identifiable';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { useInnovationFlowTemplateStatesQuery } from '../../../../core/apollo/generated/apollo-hooks';

interface InnovationFlowTemplatePreviewProps {
  template?: Identifiable;
}

const InnovationFlowTemplatePreview: FC<InnovationFlowTemplatePreviewProps> = ({ template }) => {
  const { data, loading } = useInnovationFlowTemplateStatesQuery({
    variables: {
      innovationFlowTemplateID: template?.id!,
    },
    skip: !template?.id,
  });

  const templateStates = JSON.stringify(data?.lookup.innovationFlowTemplate?.states);

  if (loading || !templateStates) {
    return (
      <Box textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageContentBlock>
      <SafeInnovationFlowVisualizer definition={templateStates} />
    </PageContentBlock>
  );
};

export default InnovationFlowTemplatePreview;
