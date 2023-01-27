import { SvgIconComponent } from '@mui/icons-material';
import { Box, TypographyProps } from '@mui/material';
import React, { PropsWithChildren } from 'react';
import { gutters } from '../grid/utils';
import { DetailText } from '../typography';

interface CardHeaderDetailProps extends TypographyProps {
  iconComponent?: SvgIconComponent;
}

const CardHeaderDetail = ({ iconComponent, children, ...containerProps }: PropsWithChildren<CardHeaderDetailProps>) => {
  return (
    <Box display="flex" gap={gutters(0.5)} {...containerProps}>
      {iconComponent && <Box component={iconComponent} maxHeight={gutters()} maxWidth={gutters()} color="primary" />}
      <DetailText noWrap>{children}</DetailText>
    </Box>
  );
};

export default CardHeaderDetail;
