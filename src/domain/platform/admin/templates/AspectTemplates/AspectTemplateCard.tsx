import React from 'react';
import BallotOutlinedIcon from '@mui/icons-material/BallotOutlined';
import SimpleCard, { SimpleCardProps } from '../../../../shared/components/SimpleCard';

interface AspectTemplateCardProps extends Omit<SimpleCardProps, 'iconComponent'> {}

const AspectTemplateCard = (props: AspectTemplateCardProps) => {
  return <SimpleCard {...props} iconComponent={BallotOutlinedIcon} />;
};

export default AspectTemplateCard;
