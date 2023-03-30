import React from 'react';
import { CanvasIcon } from '../../../../collaboration/canvas/icon/CanvasIcon';
import SimpleCard, { SimpleCardProps } from '../../../../shared/components/SimpleCard';

interface WhiteboardTemplateCardProps extends Omit<SimpleCardProps, 'iconComponent'> {}

const WhiteboardTemplateCard = (props: WhiteboardTemplateCardProps) => {
  return <SimpleCard {...props} iconComponent={CanvasIcon} />;
};

export default WhiteboardTemplateCard;
