import { TypographyProps, useTheme } from '@mui/material';
import { gutters } from '../grid/utils';
import { Caption } from '../typography';

interface BadgeCounterProps extends TypographyProps {
  count?: number;
}

const BadgeCounter = ({ count, ...props }: BadgeCounterProps) => {
  const theme = useTheme();

  return (
    <Caption
      bgcolor={theme.palette.error.dark}
      color={theme.palette.error.contrastText}
      fontWeight="bold"
      display="inline-block"
      borderRadius="50%"
      marginLeft={gutters(0.5)}
      width={gutters(1)}
      height={gutters(1)}
      textAlign="center"
      {...props}
    >
      {count}
    </Caption>
  );
};

export default BadgeCounter;
