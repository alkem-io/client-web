import { SvgIconComponent } from '@mui/icons-material';
import { Box, SvgIconProps, TypographyProps } from '@mui/material';
import React, { ElementType, PropsWithChildren } from 'react';
import { gutters } from '../grid/utils';
import { CardText } from '../typography';

interface CardHeaderDetailProps extends TypographyProps {
  iconComponent?: SvgIconComponent;
  Icon?: ElementType<SvgIconProps>;
  iconProps?: SvgIconProps;
}

const iconStyles = {
  maxHeight: gutters(),
  maxWidth: gutters(),
  color: 'primary',
};

const CardHeaderDetail = ({
  iconComponent,
  Icon,
  iconProps,
  children,
  ...containerProps
}: PropsWithChildren<CardHeaderDetailProps>) => {
  return (
    <Box display="flex" gap={gutters(0.5)} {...containerProps}>
      {iconComponent && <Box component={iconComponent} sx={iconStyles} />}
      {Icon && <Icon sx={iconStyles} {...iconProps} />}
      <CardText color="inherit" noWrap>
        {children}
      </CardText>
    </Box>
  );
};

export default CardHeaderDetail;
