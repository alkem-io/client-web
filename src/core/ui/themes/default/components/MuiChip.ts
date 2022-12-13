import { Components, Theme } from '@mui/material/styles';
import { typographyOptions } from '../../../typography/themeOptions';

const MuiChip: Components<Theme>['MuiChip'] = {
  styleOverrides: {
    sizeSmall: ({ theme }) => ({
      height: theme.spacing(2),
    }),
    iconSmall: ({ theme }) => ({
      width: theme.spacing(2),
      padding: '0.25rem',
      marginRight: theme.spacing(-1),
    }),
    labelSmall: ({ theme }) => ({
      ...theme.typography.body2,
      lineHeight: `calc(${typographyOptions.body2?.lineHeight} - 2px)`,
    }),
  },
  defaultProps: {
    size: 'small',
  },
};

export default MuiChip;
