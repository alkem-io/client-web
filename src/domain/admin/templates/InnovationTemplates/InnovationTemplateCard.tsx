import React from 'react';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import SimpleCard, { SimpleCardProps } from '../../../shared/components/SimpleCard';

interface InnovationTemplateCardProps extends Omit<SimpleCardProps, 'iconComponent'> {}

const InnovationTemplateCard = (props: InnovationTemplateCardProps) => {
  return <SimpleCard {...props} iconComponent={AutoGraphOutlinedIcon} />;
};

export default InnovationTemplateCard;
