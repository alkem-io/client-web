import { TypographyProps, useTheme } from '@mui/material';
import { AriaAttributes } from 'react';
import { gutters } from '../grid/utils';
import { Caption } from '../typography';

interface BadgeCounterProps extends TypographyProps {
  count?: number;
  size?: 'small' | 'medium';
  /**
   * Accessible label describing what the count represents.
   * Should be contextual, e.g., "3 unread messages" or "5 notifications".
   */
  'aria-label'?: AriaAttributes['aria-label'];
}

const BadgeSizes: Record<NonNullable<BadgeCounterProps['size']>, TypographyProps> = {
  small: {
    fontSize: '0.7rem',
    lineHeight: gutters(0.8),
    minWidth: gutters(0.8),
    height: gutters(0.8),
  },
  medium: {
    width: gutters(1),
    height: gutters(1),
  },
};

const BadgeCounter = ({ count, size = 'medium', ...props }: BadgeCounterProps) => {
  const theme = useTheme();

  return (
    <Caption
      role="status"
      bgcolor={theme.palette.error.dark}
      color={theme.palette.error.contrastText}
      fontWeight="bold"
      display="inline-block"
      borderRadius={BadgeSizes[size].height}
      paddingLeft={gutters(0.1)}
      marginLeft={gutters(0.5)}
      textAlign="center"
      {...BadgeSizes[size]}
      {...props}
    >
      {count}
    </Caption>
  );
};

export default BadgeCounter;
