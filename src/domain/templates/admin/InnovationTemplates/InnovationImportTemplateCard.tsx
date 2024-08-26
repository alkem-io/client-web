import React from 'react';
import { TemplateImportCardComponentProps } from '../../../platform/admin/InnovationPacks/ImportTemplatesDialogGalleryStep';
import InnovationFlowTemplateCard, {
  InnovationFlowTemplate,
} from '../../cards/InnovationFlowTemplateCard/InnovationFlowTemplateCard';

interface InnovationImportTemplateCardProps extends TemplateImportCardComponentProps<InnovationFlowTemplate> {}

const InnovationImportTemplateCard = ({ template, ...props }: InnovationImportTemplateCardProps) => {
  return <InnovationFlowTemplateCard template={template} innovationPack={template.innovationPack} {...props} />;
};

export default InnovationImportTemplateCard;
