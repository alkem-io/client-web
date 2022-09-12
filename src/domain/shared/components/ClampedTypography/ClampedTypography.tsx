import React from 'react';
import { styled, Typography, TypographyProps } from '@mui/material';

export interface ClampedTypographyProps extends TypographyProps {
  clamp: number;
}
// Using custom props with styled components
// https://styled-components.com/docs/api#using-custom-props
const ClampedTypography = styled(({ clamp, ...rest }: ClampedTypographyProps) => <Typography {...rest} />)`
  display: -webkit-box;
  -webkit-line-clamp: ${props => props.clamp};
  -webkit-box-orient: vertical;
  overflow: hidden;
`;
export default ClampedTypography;
