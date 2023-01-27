import { SvgIconComponent } from '@mui/icons-material';
import { Box, TypographyProps } from '@mui/material';
import React, { PropsWithChildren } from 'react';
import { gutters } from '../grid/utils';
import { CardText } from '../typography';

interface CardHeaderDetailProps extends TypographyProps {
  iconComponent?: SvgIconComponent;
}

const CardHeaderDetail = ({ iconComponent, children, ...containerProps }: PropsWithChildren<CardHeaderDetailProps>) => {
  return (
    <Box display="flex" gap={gutters(0.5)} {...containerProps}>
      {iconComponent && <Box component={iconComponent} maxHeight={gutters()} maxWidth={gutters()} color="primary" />}
      <CardText color="inherit" noWrap>
        {children}
      </CardText>
    </Box>
  );
};

export default CardHeaderDetail;
