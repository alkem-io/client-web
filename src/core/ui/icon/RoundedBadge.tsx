import React, { PropsWithChildren } from 'react';
import { Box, BoxProps, useTheme } from '@mui/material';

export type RoundedBadgeSize = 'medium' | 'small';

export interface RoundedBadgeProps extends BoxProps {
  size: RoundedBadgeSize;
  color?: string;
}

const getSizeInSpacing = (size: RoundedBadgeSize) => {
  switch (size) {
    case 'medium':
      return 4;
    case 'small':
      return 2.5;
  }
};

const RoundedBadge = ({
  size,
  color = 'primary.main',
  children,
  sx,
  ...containerProps
}: PropsWithChildren<RoundedBadgeProps>) => {
  const theme = useTheme();

  const sizePx = theme.spacing(getSizeInSpacing(size));

  return (
    <Box
      width={sizePx}
      height={sizePx}
      sx={{
        backgroundColor: color,
        color: 'common.white',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...sx,
      }}
      {...containerProps}
    >
      {children}
    </Box>
  );
};

export default RoundedBadge;
