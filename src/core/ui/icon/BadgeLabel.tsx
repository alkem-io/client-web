import { TypographyProps, useTheme } from '@mui/material';
import { gutters } from '../grid/utils';
import { Caption } from '../typography';

interface BadgeLabelProps extends TypographyProps {
  count?: string;
  size?: 'small' | 'medium';
}

// copy of BadgeCounter but supporting auto width text
const BadgeSizes: Record<NonNullable<BadgeLabelProps['size']>, TypographyProps> = {
  small: {
    fontSize: '0.7rem',
    lineHeight: gutters(0.8),
    width: 'auto',
    height: gutters(0.8),
  },
  medium: {
    width: 'auto',
    height: gutters(1),
  },
};

const BadgeLabel = ({ count, size = 'medium', ...props }: BadgeLabelProps) => {
  const theme = useTheme();

  return (
    <Caption
      bgcolor={theme.palette.text.primary}
      color={theme.palette.background.paper}
      fontWeight="bold"
      display="inline-block"
      borderRadius={`${theme.shape.borderRadius / 2}px`}
      paddingX={gutters(0.2)}
      textAlign="center"
      {...BadgeSizes[size]}
      {...props}
    >
      {count}
    </Caption>
  );
};

export default BadgeLabel;
