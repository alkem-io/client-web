import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogGalleryStep';
import InnovationFlowTemplateCard from '../../../../collaboration/InnovationFlow/InnovationFlowTemplateCard/InnovationFlowTemplateCard';
import { Template } from '../AdminTemplatesSection';

interface InnovationFlowTemplate extends Template {
  definition: string;
}

interface InnovationImportTemplateCardProps extends TemplateImportCardComponentProps<InnovationFlowTemplate> {}

const InnovationImportTemplateCard = ({ template, ...props }: InnovationImportTemplateCardProps) => {
  return <InnovationFlowTemplateCard template={template} innovationPack={template.innovationPack} {...props} />;
};

export default InnovationImportTemplateCard;
