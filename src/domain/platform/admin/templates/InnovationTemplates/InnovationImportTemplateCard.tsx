import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/TemplatesGallery';
import ActionsCard from '../../../../shared/components/ActionsCard';
import { getVisualBanner } from '../../../../../common/utils/visuals.utils';

interface InnovationImportTemplateCardProps extends TemplateImportCardComponentProps {}

const InnovationImportTemplateCard = ({ template }: InnovationImportTemplateCardProps) => {
  return <ActionsCard title={template.info.title} imageUrl={getVisualBanner(template.info.visual)} />;
};

export default InnovationImportTemplateCard;
