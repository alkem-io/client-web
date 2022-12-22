import React, { FC } from 'react';
import { DistributiveOmit } from '@mui/types';
import { styled, Box, Typography, TypographyProps } from '@mui/material';

type CharacterCounterProps = DistributiveOmit<TypographyProps, 'variant'> & {
  count?: number;
  separator?: string;
  maxLength?: number;
};

const Container = styled(Box)(() => ({
  position: 'relative',
}));

const CounterText = styled(Typography)(() => ({
  position: 'absolute',
  right: 0,
}));

const getText = (count: number, separator: string, maxLength?: number) => {
  if (maxLength && count > maxLength) {
    return <Typography color="red">{`${count}${maxLength !== undefined ? separator + maxLength : ''}`}</Typography>;
  } else {
    return <Typography>{`${count}${maxLength !== undefined ? separator + maxLength : ''}`}</Typography>;
  }
};

export const CharacterCounter: FC<CharacterCounterProps> = ({ count = 0, separator = ' / ', maxLength, ...rest }) => {
  return (
    <Container>
      <CounterText variant="caption" {...rest}>
        {getText(count, separator, maxLength)}
      </CounterText>
    </Container>
  );
};

export default CharacterCounter;
