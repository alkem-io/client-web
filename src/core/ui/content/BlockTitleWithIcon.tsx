import { Box, BoxProps, SvgIconProps, TypographyProps } from '@mui/material';
import { gutters } from '../grid/utils';
import { cloneElement, ReactElement, ReactNode } from 'react';
import { BlockTitle } from '../typography';

type BlockTitleWithIconProps = {
  title: ReactNode;
  icon?: ReactElement<SvgIconProps>;
  variant?: TypographyProps['variant'];
};

const BlockTitleWithIcon = ({
  title,
  icon,
  variant = 'h3',
  children,
  ...props
}: BlockTitleWithIconProps & Omit<BoxProps, 'title'>) => (
  <Box
    flexGrow={1}
    flexShrink={1}
    minWidth={0}
    display="flex"
    gap={gutters(0.5)}
    alignItems={icon ? 'center' : 'start'}
    {...props}
  >
    {icon && cloneElement(icon, { fontSize: 'small' })}
    {title && (
      <BlockTitle variant={variant} noWrap>
        {title}
      </BlockTitle>
    )}
    {children}
  </Box>
);

export default BlockTitleWithIcon;
