import React from 'react';
import { useAuthenticationContext } from '../hooks/useAuthenticationContext';
import { createStyles } from '../hooks/useTheme';

const useGlobalStyles = createStyles(theme => ({
  '@global': {
    '*::-webkit-scrollbar': {
      width: '0.4em',
    },
    '*::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px grey',
    },
    '*::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.primary,
      outline: `1px solid ${theme.palette.neutral}`,
    },
    html: {
      height: '100%',
    },
    body: {
      height: '100%',
      margin: 0,
    },
    '#app': {
      height: '100%',
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
  },
}));

const App = (): React.ReactElement => {
  useGlobalStyles();
  const { context, isAuthenticated } = useAuthenticationContext();

  let page = <div>Restricted hello</div>;

  if (!context.authenticationEnabled || isAuthenticated) {
    page = <div>Unrestricted hello</div>;
  }

  return <div id="app">{page}</div>;
};

export default App;
