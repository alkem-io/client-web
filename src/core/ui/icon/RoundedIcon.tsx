import { Box, BoxProps, styled, useTheme } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

const RoundedIconContainer = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.dark,
  color: theme.palette.common.white,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

type RoundedIconSize = 'medium' | 'small';

interface RoundedIconProps {
  size: RoundedIconSize;
  component: SvgIconComponent;
}

const getSizeInSpacing = (size: RoundedIconSize) => {
  switch (size) {
    case 'medium':
      return 4;
    case 'small':
      return 2.5;
  }
};

const RoundedIcon = ({ size, component: Icon, ...containerProps }: RoundedIconProps & BoxProps) => {
  const theme = useTheme();

  const sizePx = theme.spacing(getSizeInSpacing(size));

  return (
    <RoundedIconContainer width={sizePx} height={sizePx} {...containerProps}>
      <Icon fontSize={size} />
    </RoundedIconContainer>
  );
};

export default RoundedIcon;
