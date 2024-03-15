import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogGalleryStep';
import InnovationFlowTemplateCard, {
  InnovationFlowTemplate,
} from '../../../../collaboration/InnovationFlow/InnovationFlowTemplateCard/InnovationFlowTemplateCard';

interface InnovationImportTemplateCardProps extends TemplateImportCardComponentProps<InnovationFlowTemplate> {}

const InnovationImportTemplateCard = ({ template, ...props }: InnovationImportTemplateCardProps) => {
  return <InnovationFlowTemplateCard template={template} innovationPack={template.innovationPack} {...props} />;
};

export default InnovationImportTemplateCard;
