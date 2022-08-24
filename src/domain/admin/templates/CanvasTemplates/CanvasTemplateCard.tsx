import React from 'react';
import { WbIncandescentOutlined } from '@mui/icons-material';
import SimpleCard, { SimpleCardProps } from '../../../shared/components/SimpleCard';

interface CanvasTemplateCardProps extends Omit<SimpleCardProps, 'iconComponent'> {}

const CanvasTemplateCard = (props: CanvasTemplateCardProps) => {
  return <SimpleCard {...props} iconComponent={WbIncandescentOutlined} />;
};

export default CanvasTemplateCard;
