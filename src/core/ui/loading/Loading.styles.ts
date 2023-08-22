import { makeStyles } from '@mui/styles';

export const useLoadingStyles = makeStyles(theme => ({
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
