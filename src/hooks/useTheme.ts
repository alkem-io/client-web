import { Classes } from 'jss';
import { useContext } from 'react';
import { createUseStyles, Styles } from 'react-jss';
import { Theme, ThemeContext } from '../context/ThemeProvider';
// import { functor } from '../utils/functor';

export const useTheme = () => {
  const theme = useContext(ThemeContext);

  return { theme };
};

// can use the default jss theming convention but avoiding it because it's easier
export const createStyles: <C extends string = string>(
  styles: Styles<C> | ((theme: Theme) => Styles<C>)
) => (data?: unknown) => Classes<C> = styles => {
  const useStyles = (props: unknown) => {
    // can explicit theme overrides here
    const theme = useContext(ThemeContext);
    // and merge them

    let themedStyles = styles;
    if (typeof styles === 'function') {
      themedStyles = styles(theme);
    }
    return createUseStyles(themedStyles)(props);
  };

  return useStyles;
};
