import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogGalleryStep';
import MemberGuidelineTemplateCard from '../../../../collaboration/memberGuidelines/MemberGuidelinesTemplateCard/MemberGuidelinesTemplateCard';

interface MemberGuidelinesImportTemplateCardProps extends TemplateImportCardComponentProps {}

const MemberGuidelinesImportTemplateCard = ({ template, ...props }: MemberGuidelinesImportTemplateCardProps) => {
  return <MemberGuidelineTemplateCard template={template} innovationPack={template.innovationPack} {...props} />;
};

export default MemberGuidelinesImportTemplateCard;
