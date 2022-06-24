import React from 'react';
import PanoramaOutlinedIcon from '@mui/icons-material/PanoramaOutlined';
import TemplateCardLayout from '../TemplateCardLayout';
import { TemplateCardProps } from '../TemplateCardProps';

interface AspectTemplateCardProps extends Omit<TemplateCardProps, 'iconComponent'> {}

const AspectTemplateCard = (props: AspectTemplateCardProps) => {
  return <TemplateCardLayout {...props} iconComponent={PanoramaOutlinedIcon} />;
};

export default AspectTemplateCard;
