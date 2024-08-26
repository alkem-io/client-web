import React from 'react';
import { TemplateImportCardComponentProps } from '../../../platform/admin/InnovationPacks/ImportTemplatesDialogGalleryStep';
import CalloutTemplateCard, { CalloutTemplate } from '../../cards/CalloutTemplateCard/CalloutTemplateCard';

interface CalloutImportTemplateCardProps extends TemplateImportCardComponentProps<CalloutTemplate> {}

const CalloutImportTemplateCard = ({ template, ...props }: CalloutImportTemplateCardProps) => {
  return <CalloutTemplateCard template={template} innovationPack={template.innovationPack} {...props} />;
};

export default CalloutImportTemplateCard;
