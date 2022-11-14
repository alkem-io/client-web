import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/TemplatesGallery';
import { getVisualBanner } from '../../../../../common/utils/visuals.utils';
import ActionsCard from '../../../../shared/components/ActionsCard';

interface AspectImportTemplateCardProps extends TemplateImportCardComponentProps {}

const AspectImportTemplateCard = ({ template }: AspectImportTemplateCardProps) => {
  return <ActionsCard title={template.info.title} imageUrl={getVisualBanner(template.info.visual)} />;
};

export default AspectImportTemplateCard;
