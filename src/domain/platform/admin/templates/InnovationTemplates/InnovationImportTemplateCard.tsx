import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogGalleryStep';
import InnovationFlowTemplateCard from '../../../../collaboration/InnovationFlow/InnovationFlowTemplateCard/InnovationFlowTemplateCard';

interface InnovationImportTemplateCardProps extends TemplateImportCardComponentProps {}

const InnovationImportTemplateCard = ({ template, ...props }: InnovationImportTemplateCardProps) => {
  return <InnovationFlowTemplateCard template={template} innovationPack={template.innovationPack} {...props} />;
};

export default InnovationImportTemplateCard;
