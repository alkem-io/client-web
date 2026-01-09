import { Box, BoxProps, SvgIconProps, TypographyProps } from '@mui/material';
import { gutters } from '../grid/utils';
import { cloneElement, ReactElement, ReactNode } from 'react';
import { BlockTitle, Caption } from '../typography';

type BlockTitleWithIconProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  titleId?: string;
  icon?: ReactElement<SvgIconProps>;
  avatar?: ReactNode;
  variant?: TypographyProps['variant'];
};

const BlockTitleWithIcon = ({
  title,
  subtitle,
  titleId,
  icon,
  avatar,
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
    id={titleId}
    {...props}
  >
    {icon && cloneElement(icon, { fontSize: 'small' })}
    {avatar}
    {title && typeof title === 'string' ? (
      <BlockTitle variant={variant} noWrap sx={{ color: theme => theme.palette.text.primary }}>
        {title}
        {subtitle}
      </BlockTitle>
    ) : (
      <Caption noWrap>{title}</Caption>
    )}
    {children}
  </Box>
);

export default BlockTitleWithIcon;
