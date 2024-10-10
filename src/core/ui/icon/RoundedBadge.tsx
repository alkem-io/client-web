import React, { PropsWithChildren } from 'react';
import { Box, BoxProps, SxProps, Theme, useTheme } from '@mui/material';

export type RoundedBadgeSize = 'medium' | 'small' | 'xsmall';

export interface RoundedBadgeProps extends BoxProps {
  size: RoundedBadgeSize;
  color?: string;
  sx?: SxProps<Theme>;
}

const getSizeInSpacing = (size: RoundedBadgeSize) => {
  switch (size) {
    case 'medium':
      return 4;
    case 'small':
      return 2.5;
    case 'xsmall':
      return 2;
  }
};

const RoundedBadge = ({
  size,
  color = 'primary.main',
  borderRadius = '50%',
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
        borderRadius,
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
