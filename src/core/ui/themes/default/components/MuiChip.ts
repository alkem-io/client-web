import { Components, Theme } from '@mui/material/styles';
import { themeTypographyOptions } from '@/core/ui/typography/themeTypographyOptions';

const MuiChip: Components<Theme>['MuiChip'] = {
  styleOverrides: {
    sizeSmall: ({ theme }) => ({
      height: theme.spacing(2),
    }),
    sizeMedium: ({ theme }) => ({
      height: theme.spacing(2.5),
    }),
    iconSmall: ({ theme }) => ({
      width: theme.spacing(2),
      padding: '0.25rem',
      marginRight: theme.spacing(-1),
    }),
    labelSmall: ({ theme }) => ({
      ...theme.typography.body2,
      lineHeight: `calc(${themeTypographyOptions.body2?.lineHeight} - 2px)`,
    }),
    labelMedium: ({ theme, ownerState }) => ({
      ...theme.typography.body2,
      lineHeight: ownerState.variant === 'outlined' ? `calc(${theme.spacing(2.5)} - 2px)` : theme.spacing(2.5),
    }),
  },
  defaultProps: {
    size: 'small',
  },
};

export default MuiChip;
