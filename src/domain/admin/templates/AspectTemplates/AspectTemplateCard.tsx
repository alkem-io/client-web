import React from 'react';
import PanoramaOutlinedIcon from '@mui/icons-material/PanoramaOutlined';
import SimpleCard, { SimpleCardProps } from '../../../shared/components/SimpleCard';

interface AspectTemplateCardProps extends Omit<SimpleCardProps, 'iconComponent'> {}

const AspectTemplateCard = (props: AspectTemplateCardProps) => {
  return <SimpleCard {...props} iconComponent={PanoramaOutlinedIcon} />;
};

export default AspectTemplateCard;
