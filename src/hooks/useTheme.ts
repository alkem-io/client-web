import makeStyles from '@material-ui/core/styles/makeStyles';
import useThemeMui from '@material-ui/core/styles/useTheme';

export const useTheme = useThemeMui;

// can use the default jss theming convention but avoiding it because it's easier
export const createStyles = makeStyles;
