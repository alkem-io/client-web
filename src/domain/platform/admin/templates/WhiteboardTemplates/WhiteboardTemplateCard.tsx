import React from 'react';
import { WhiteboardIcon } from '../../../../collaboration/whiteboard/icon/WhiteboardIcon';
import SimpleCard, { SimpleCardProps } from '../../../../shared/components/SimpleCard';

interface WhiteboardTemplateCardProps extends Omit<SimpleCardProps, 'iconComponent'> {}

const WhiteboardTemplateCard = (props: WhiteboardTemplateCardProps) => {
  return <SimpleCard {...props} iconComponent={WhiteboardIcon} />;
};

export default WhiteboardTemplateCard;
