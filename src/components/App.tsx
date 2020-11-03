import React from 'react';
import { useAuthenticationContext } from '../hooks/useAuthenticationContext';
import { createStyles } from '../hooks/useTheme';
import Header from './layout/Header';
import User from './layout/User';
import Main from './layout/Main';
import Footer from './layout/Footer';

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
      fontFamily: '"Source Sans Pro", "Montserrat"',
    },
    '#root': {
      height: '100%',
    },
    '#app': {
      height: '100%',
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
  },
}));

const App = (): React.ReactElement => {
  useGlobalStyles();
  const { context, isAuthenticated } = useAuthenticationContext();

  let page = <div>Restricted hello</div>;

  if (!context.authenticationEnabled || isAuthenticated) {
    page = new Array(100).fill(<div>Unrestricted hello</div>).reduce((aggr, el) => (
      <>
        {aggr}
        {el}
      </>
    ));
  }

  return (
    <div id="app">
      <Header>
        {isVisible => (
          <div style={{ display: 'flex', flexGrow: 1, flexDirection: 'row' }}>
            <User name="John Smith" title="Challenge lead" orientation={isVisible ? 'vertical' : 'horizontal'} />
            <div style={{ display: 'flex', flexGrow: 1 }} />
            <div style={{ display: 'flex' }}>Navigation</div>
          </div>
        )}
      </Header>
      <Main>{page}</Main>
      <Footer></Footer>
    </div>
  );
};

export default App;
