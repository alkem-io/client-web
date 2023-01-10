import React, { FC } from 'react';
import { Ribbon, RibbonProps } from './Ribbon';
import { Body2Text } from '../typography';

const DEFAULT_PADDING = 0.5;

interface CardRibbonProps extends RibbonProps {
  text: string;
}

const CardRibbon: FC<CardRibbonProps> = ({ text, sx, ...rest }) => {
  return (
    <Ribbon padding={DEFAULT_PADDING} sx={{ position: 'absolute', width: '100%', ...sx }} {...rest}>
      <Body2Text textAlign="center">{text}</Body2Text>
    </Ribbon>
  );
};

export default CardRibbon;
