import React from 'react';
import { CanvasIcon } from '../../../../../common/icons/CanvasIcon';
import SimpleCard, { SimpleCardProps } from '../../../../shared/components/SimpleCard';

interface CanvasTemplateCardProps extends Omit<SimpleCardProps, 'iconComponent'> {}

const CanvasTemplateCard = (props: CanvasTemplateCardProps) => {
  return <SimpleCard {...props} iconComponent={CanvasIcon} />;
};

export default CanvasTemplateCard;
