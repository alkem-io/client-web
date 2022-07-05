import React, { FC } from 'react';
import { DistributiveOmit } from '@mui/types';
import { styled, Box, Typography, TypographyProps } from '@mui/material';

type CharacterCounterProps = DistributiveOmit<TypographyProps, 'variant'> & {
  count?: number;
  maxLength?: number;
  separator?: string;
};

const Container = styled(Box)(() => ({
  position: 'relative',
}));

const CounterText = styled(Typography)(() => ({
  position: 'absolute',
  right: 0,
}));

export const CharacterCounter: FC<CharacterCounterProps> = ({ count, maxLength, separator = ' / ', ...rest }) => {
  return (
    <Container>
      <CounterText variant="caption" {...rest}>
        {`${count ? count : 0}${maxLength ? separator + maxLength : ''}`}
      </CounterText>
    </Container>
  );
};
export default CharacterCounter;
