import React from 'react';
import { Caption } from '../typography';

interface CardFooterDateProps {
  date: string | Date;
}

const CardFooterDate = ({ date }: CardFooterDateProps) => {
  const localeDateString = new Date(date).toLocaleDateString();

  return <Caption paddingX={0.5}>{localeDateString}</Caption>;
};

export default CardFooterDate;
