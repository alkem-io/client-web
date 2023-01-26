import React, { FC } from 'react';
import { Ribbon, RibbonProps } from './Ribbon';
import { RibbonText } from '../typography';

interface CardRibbonProps extends RibbonProps {
  text: string;
}

const CardRibbon: FC<CardRibbonProps> = ({ text, sx, ...rest }) => {
  return (
    <Ribbon padding={0.5} sx={{ position: 'absolute', width: '100%', ...sx }} {...rest}>
      <RibbonText>{text}</RibbonText>
    </Ribbon>
  );
};

export default CardRibbon;
