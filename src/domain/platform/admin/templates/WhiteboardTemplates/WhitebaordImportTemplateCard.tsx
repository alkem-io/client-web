import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogGalleryStep';
import WhiteboardTemplateCard from '../../../../collaboration/whiteboard/WhiteboardTemplateCard/WhiteboardTemplateCard';

interface WhiteboardImportTemplateCardProps extends TemplateImportCardComponentProps {}

const WhiteboardImportTemplateCard = ({ template, ...props }: WhiteboardImportTemplateCardProps) => {
  return <WhiteboardTemplateCard template={template} innovationPack={template.innovationPack} {...props} />;
};

export default WhiteboardImportTemplateCard;
