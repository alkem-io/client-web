import React from 'react';
import { TemplateImportCardComponentProps } from '../../../platform/admin/InnovationPacks/ImportTemplatesDialogGalleryStep';
import CommunityGuidelinesTemplateCard from '../../_new/components/cards/CommunityGuidelinesTemplateCard';

interface CommunityGuidelinesImportTemplateCardProps extends TemplateImportCardComponentProps {}

const CommunityGuidelinesImportTemplateCard = ({ template, ...props }: CommunityGuidelinesImportTemplateCardProps) => {
  return <CommunityGuidelinesTemplateCard template={template} innovationPack={template.innovationPack} {...props} />;
};

export default CommunityGuidelinesImportTemplateCard;
