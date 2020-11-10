import { AccountInfo } from '@azure/msal-browser';
import { ReactComponent as ChevronUpIcon } from 'bootstrap-icons/icons/chevron-up.svg';
import React, { FC, useRef } from 'react';
import { useAuthenticationContext } from '../hooks/useAuthenticationContext';
import { useNavigation } from '../hooks/useNavigation';
import { createStyles } from '../hooks/useTheme';
import { useTypedSelector } from '../hooks/useTypedSelector';
import Breadcrumbs from './core/Breadcrumbs';
import Button from './core/Button';
import Icon from './core/Icon';
import IconButton from './core/IconButton';
import Loading from './core/Loading';
import Section from './core/Section';
import Footer from './layout/Footer';
import Header from './layout/Header';
import Main from './layout/Main';
import Navigation from './layout/Navigation';
import User from './layout/User';
import NavRings from './NavRings';

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

interface UserSegmentProps {
  orientation: 'vertical' | 'horizontal';
}

const UserSegment: FC<UserSegmentProps> = ({ orientation }) => {
  const account = useTypedSelector<AccountInfo | null>(state => state.auth.account);

  return account && <User name={account.name || account.username} title={account.username} orientation={orientation} />;
};

const App = ({ children }): React.ReactElement => {
  useGlobalStyles();
  const { context, isAuthenticated } = useAuthenticationContext();
  const { paths } = useNavigation();
  const headerRef = useRef<HTMLElement>(null);

  if (context.loading) return <Loading />;

  return (
    <div id="app">
      <NavRings paths={paths} />
      <Header innerRef={headerRef}>
        {isVisible => (
          <div style={{ display: 'flex', flexGrow: 1, flexDirection: 'row' }}>
            <UserSegment orientation={isVisible ? 'vertical' : 'horizontal'} />
            <div style={{ display: 'flex', flexGrow: 1 }} />
            {isAuthenticated && <Navigation maximize={isVisible} showAdmin />}
            {!isAuthenticated && <Button text={'Login'} onClick={context.handleSignIn} small></Button>}
          </div>
        )}
      </Header>
      <Main>
        <Section
          hideDetails
          gutters={{ content: false, details: false, root: true }}
          classes={{
            padding: '0',
          }}
        >
          <Breadcrumbs paths={paths} />
        </Section>
        {children}
      </Main>
      <Footer>
        <IconButton onClick={() => headerRef.current?.scrollIntoView({ behavior: 'smooth' })}>
          <Icon component={ChevronUpIcon} color="inherit" size={'lg'} />
        </IconButton>
      </Footer>
    </div>
  );
};

export default App;
