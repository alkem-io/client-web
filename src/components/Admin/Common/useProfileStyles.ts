import { makeStyles } from '@mui/styles';

const useProfileStyles = makeStyles(theme => ({
  field: {
    marginBottom: theme.spacing(2),
  },
  row: {
    display: 'flex',
    gap: 20,
    alignItems: 'center',
    '& > div': {
      flexGrow: 1,
    },
  },
}));

export default useProfileStyles;
