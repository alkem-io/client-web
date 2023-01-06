import React from 'react';
import { styled, Typography, TypographyProps } from '@mui/material';

export interface ClampedTypographyProps extends TypographyProps {
  clamp: number;
  component?: React.ElementType;
}
// Using custom props with styled components
// https://styled-components.com/docs/api#using-custom-props

// line-clamp css tricks
//https://css-tricks.com/almanac/properties/l/line-clamp/
/**
 * @deprecated use webkitLineClamp()
 */
const ClampedTypography = styled(({ clamp, ...rest }: ClampedTypographyProps) => <Typography {...rest} />)`
  display: -webkit-box;
  -webkit-line-clamp: ${props => props.clamp};
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export default ClampedTypography;
