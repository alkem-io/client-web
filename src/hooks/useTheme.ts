import { useTheme as useThemeMui } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';

export const useTheme = useThemeMui;

// can use the default jss theming convention but avoiding it because it's easier
export const createStyles = makeStyles;
