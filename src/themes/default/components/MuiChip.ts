import { Components, emphasize, Theme } from '@mui/material/styles';

const MuiChip = (theme: Theme): Components['MuiChip'] | undefined => {
  if (!theme) {
    return undefined;
  }
  return {
    styleOverrides: {
      outlined: {
        borderColor: theme.palette.secondary.main,
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
      iconSmall: {
        width: theme.spacing(2),
        height: theme.spacing(2),
        padding: '0.25rem',
        marginRight: theme.spacing(-1),
      },
      labelSmall: {
        lineHeight: '1rem',
      },
    },
    defaultProps: {
      size: 'small',
    },
  };
};
export default MuiChip;
