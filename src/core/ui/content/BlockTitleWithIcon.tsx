import { Box, type BoxProps, type SvgIconProps, type TypographyProps } from '@mui/material';
import { cloneElement, type ReactElement, type ReactNode } from 'react';
import { gutters } from '../grid/utils';
import { BlockTitle, Caption } from '../typography';

type BlockTitleWithIconProps = {
  title: ReactNode;
  subtitle?: string;
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
      <Box>
        <BlockTitle variant={variant} noWrap={true} color="textPrimary">
          {title}
        </BlockTitle>
        <Caption>{subtitle}</Caption>
      </Box>
    ) : (
      <Caption noWrap={true}>{title}</Caption>
    )}
    {children}
  </Box>
);

export default BlockTitleWithIcon;
