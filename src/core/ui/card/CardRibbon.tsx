import React, { FC } from 'react';
import { Ribbon, RibbonProps } from './Ribbon';
import { RibbonText } from '../typography';

const DEFAULT_PADDING = 0.5;

interface CardRibbonProps extends RibbonProps {
  text: string;
}

const CardRibbon: FC<CardRibbonProps> = ({ text, sx, ...rest }) => {
  return (
    <Ribbon padding={DEFAULT_PADDING} sx={{ position: 'absolute', width: '100%', ...sx }} {...rest}>
      <RibbonText>{text}</RibbonText>
    </Ribbon>
  );
};

export default CardRibbon;
