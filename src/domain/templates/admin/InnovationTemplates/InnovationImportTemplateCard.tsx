import React from 'react';
import { TemplateImportCardComponentProps } from '../../../platform/admin/InnovationPacks/ImportTemplatesDialogGalleryStep';
import InnovationFlowTemplateCard, {
  InnovationFlowTemplate,
} from '../../_new/components/cards/InnovationFlowTemplateCard';

interface InnovationImportTemplateCardProps extends TemplateImportCardComponentProps<InnovationFlowTemplate> {}

const InnovationImportTemplateCard = ({ template, ...props }: InnovationImportTemplateCardProps) => {
  return <InnovationFlowTemplateCard template={template} innovationPack={template.innovationPack} {...props} />;
};

export default InnovationImportTemplateCard;
