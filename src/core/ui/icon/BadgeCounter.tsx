import { TypographyProps, useTheme } from '@mui/material';
import { gutters } from '../grid/utils';
import { Caption } from '../typography';

interface BadgeCounterProps extends TypographyProps {
  count?: number;
  size?: 'small' | 'medium';
}

const BadgeSizes: Record<NonNullable<BadgeCounterProps['size']>, TypographyProps> = {
  small: {
    fontSize: '0.7rem',
    lineHeight: gutters(0.8),
    width: gutters(0.8),
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
      bgcolor={theme.palette.error.dark}
      color={theme.palette.error.contrastText}
      fontWeight="bold"
      display="inline-block"
      borderRadius="50%"
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
