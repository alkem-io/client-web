import React, { ComponentType } from 'react';
import { Box, BoxProps, styled, SvgIconProps, useTheme } from '@mui/material';

const RoundedIconContainer = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.dark,
  color: theme.palette.common.white,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

type RoundedIconSize = 'medium' | 'small';

export interface RoundedIconProps {
  size: RoundedIconSize;
  component: ComponentType<SvgIconProps>;
}

const getSizeInSpacing = (size: RoundedIconSize) => {
  switch (size) {
    case 'medium':
      return 4;
    case 'small':
      return 2.5;
  }
};

const RoundedIcon = ({ size, component: Icon, ...containerProps }: RoundedIconProps & BoxProps) => {
  const theme = useTheme();

  const sizePx = theme.spacing(getSizeInSpacing(size));

  return (
    <RoundedIconContainer width={sizePx} height={sizePx} {...containerProps}>
      <Icon fontSize={size} />
    </RoundedIconContainer>
  );
};

export default RoundedIcon;
