import { Components, emphasize, Theme } from '@mui/material/styles';
import { typographyOptions } from '../../../typography/themeOptions';

const MuiChip = (theme: Theme): Components['MuiChip'] => {
  return {
    styleOverrides: {
      outlined: {
        borderColor: theme.palette.primary.main,
        textColor: theme.palette.text.primary,
      },
      root: {
        color: theme.palette.primary.main,
      },
      outlinedPrimary: {
        borderColor: theme.palette.secondary.main,
        textColor: theme.palette.text.primary,
      },
      iconColorPrimary: {
        color: theme.palette.primary.main,
      },
      deleteIconColorPrimary: {
        color: theme.palette.neutralMedium.main,

        '&:hover': {
          // coefficient from material UI code base for hover effects
          color: emphasize(theme.palette.neutralMedium.main, 0.08),
        },
      },
      sizeSmall: {
        height: theme.spacing(2),
      },
      iconSmall: {
        width: theme.spacing(2),
        padding: '0.25rem',
        marginRight: theme.spacing(-1),
      },
      labelSmall: {
        ...typographyOptions.body2,
        lineHeight: `calc(${typographyOptions.body2?.lineHeight} - 2px)`,
      },
    },
    defaultProps: {
      size: 'small',
    },
  };
};

export default MuiChip;
