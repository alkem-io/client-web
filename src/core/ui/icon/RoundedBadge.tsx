import React, { PropsWithChildren } from 'react';
import { Box, BoxProps, styled, useTheme } from '@mui/material';

export const RoundedBadgeContainer = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.main,
  color: theme.palette.common.white,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

export type RoundedBadgeSize = 'medium' | 'small';

export interface RoundedBadgeProps {
  size: RoundedBadgeSize;
}

const getSizeInSpacing = (size: RoundedBadgeSize) => {
  switch (size) {
    case 'medium':
      return 4;
    case 'small':
      return 2.5;
  }
};

const RoundedBadge = ({ size, children, ...containerProps }: PropsWithChildren<RoundedBadgeProps & BoxProps>) => {
  const theme = useTheme();

  const sizePx = theme.spacing(getSizeInSpacing(size));

  return (
    <RoundedBadgeContainer width={sizePx} height={sizePx} {...containerProps}>
      {children}
    </RoundedBadgeContainer>
  );
};

export default RoundedBadge;
