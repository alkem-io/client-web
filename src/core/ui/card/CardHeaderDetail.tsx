import { Box, type SvgIconProps, type TypographyProps } from '@mui/material';
import React, { type PropsWithChildren, type ReactElement } from 'react';
import { gutters } from '../grid/utils';
import { CardText } from '../typography';

interface CardHeaderDetailProps extends TypographyProps {
  iconComponent?: ReactElement<SvgIconProps>;
  iconProps?: SvgIconProps;
}

const iconStyles = {
  maxHeight: gutters(),
  maxWidth: gutters(),
  color: 'primary',
};

const CardHeaderDetail = ({
  iconComponent,
  iconProps,
  children,
  ...containerProps
}: PropsWithChildren<CardHeaderDetailProps>) => (
  <Box display="flex" alignItems={'center'} gap={gutters(0.5)} {...containerProps}>
    {iconComponent && React.cloneElement(iconComponent, { sx: { ...iconStyles }, ...iconComponent.props })}
    <CardText color="inherit" noWrap={true}>
      {children}
    </CardText>
  </Box>
);

export default CardHeaderDetail;
