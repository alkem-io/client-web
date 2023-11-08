import React from 'react';
import { CalloutIcon } from '../../../../collaboration/callout/icon/CalloutIcon';
import SimpleCard, { SimpleCardProps } from '../../../../shared/components/SimpleCard';

interface CalloutTemplateCardProps extends Omit<SimpleCardProps, 'iconComponent'> {}

const CalloutTemplateCard = (props: CalloutTemplateCardProps) => {
  return <SimpleCard {...props} iconComponent={CalloutIcon} />;
};

export default CalloutTemplateCard;
