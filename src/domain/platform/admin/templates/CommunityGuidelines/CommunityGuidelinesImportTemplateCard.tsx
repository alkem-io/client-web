import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogGalleryStep';
import CommunityGuidelinesTemplateCard from '../../../../collaboration/communityGuidelines/CommunityGuidelinesTemplateCard/CommunityGuidelinesTemplateCard';

interface CommunityGuidelinesImportTemplateCardProps extends TemplateImportCardComponentProps {}

const CommunityGuidelinesImportTemplateCard = ({ template, ...props }: CommunityGuidelinesImportTemplateCardProps) => {
  return <CommunityGuidelinesTemplateCard template={template} innovationPack={template.innovationPack} {...props} />;
};

export default CommunityGuidelinesImportTemplateCard;
