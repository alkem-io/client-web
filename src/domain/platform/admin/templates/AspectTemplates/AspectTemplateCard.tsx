import React from 'react';
import { AspectIcon } from '../../../../collaboration/aspect/icon/AspectIcon';
import SimpleCard, { SimpleCardProps } from '../../../../shared/components/SimpleCard';

interface AspectTemplateCardProps extends Omit<SimpleCardProps, 'iconComponent'> {}

const AspectTemplateCard = (props: AspectTemplateCardProps) => {
  return <SimpleCard {...props} iconComponent={AspectIcon} />;
};

export default AspectTemplateCard;
