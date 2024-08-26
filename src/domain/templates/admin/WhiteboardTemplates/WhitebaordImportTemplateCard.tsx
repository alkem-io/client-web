import React from 'react';
import { TemplateImportCardComponentProps } from '../../../platform/admin/InnovationPacks/ImportTemplatesDialogGalleryStep';
import WhiteboardTemplateCard from '../../cards/WhiteboardTemplateCard/WhiteboardTemplateCard';

interface WhiteboardImportTemplateCardProps extends TemplateImportCardComponentProps {}

const WhiteboardImportTemplateCard = ({ template, ...props }: WhiteboardImportTemplateCardProps) => {
  return <WhiteboardTemplateCard template={template} innovationPack={template.innovationPack} {...props} />;
};

export default WhiteboardImportTemplateCard;
