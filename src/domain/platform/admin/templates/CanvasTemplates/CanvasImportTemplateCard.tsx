import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/TemplatesGallery';
import ActionsCard from '../../../../shared/components/ActionsCard';
import { getVisualBanner } from '../../../../../common/utils/visuals.utils';

interface CanvasImportTemplateCardProps extends TemplateImportCardComponentProps {}

const CanvasImportTemplateCard = ({ template }: CanvasImportTemplateCardProps) => {
  return <ActionsCard title={template.info.title} imageUrl={getVisualBanner(template.info.visual)} />;
};

export default CanvasImportTemplateCard;
