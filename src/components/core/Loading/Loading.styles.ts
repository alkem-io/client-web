import { createStyles } from '../../../hooks/useTheme';

export const useLoadingStyles = createStyles(theme => ({
  spinner: {
    color: theme.palette.primary.main,
  },
  text: {
    marginLeft: theme.spacing(2),
  },
  container: {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
}));
