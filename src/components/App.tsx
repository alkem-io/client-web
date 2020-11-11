import { AccountInfo } from '@azure/msal-browser';
import { ReactComponent as ChevronUpIcon } from 'bootstrap-icons/icons/chevron-up.svg';
import React, { FC, useRef } from 'react';
import { ErrorHandler } from '../containers/ErrorHandler';
import { UserMetadata } from '../context/UserProvider';
import { useAuthenticationContext } from '../hooks/useAuthenticationContext';
import { useUserContext } from '../hooks/useUserContext';
import { useAuthenticate } from '../hooks/useAuthenticate';
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
  userMetadata: UserMetadata;
}

const UserSegment: FC<UserSegmentProps> = ({ orientation, userMetadata }) => {
  const { user, roles } = userMetadata;
  return (
    user && (
      <User
        name={user.name}
        title={roles[roles.length - 1] || 'unknown'}
        orientation={orientation}
        src={user.profile?.avatar}
      />
    )
  );
};

const App = ({ children }): React.ReactElement => {
  useGlobalStyles();
  const { safeAuthenticate, safeUnauthenticate } = useAuthenticate();
  const { context } = useAuthenticationContext();
  const { user, loading } = useUserContext();
  const { paths } = useNavigation();
  const headerRef = useRef<HTMLElement>(null);

  if (context.loading || loading) return <Loading />;

  return (
    <div id="app">
      <NavRings paths={paths} />
      <Header innerRef={headerRef}>
        {isVisible => (
          <div style={{ display: 'flex', flexGrow: 1, flexDirection: 'row', alignItems: 'center' }}>
            {user && <UserSegment userMetadata={user} orientation={isVisible ? 'vertical' : 'horizontal'} />}
            <div style={{ display: 'flex', flexGrow: 1 }} />
            <Navigation
              maximize={isVisible}
              userMetadata={user}
              onSignIn={safeAuthenticate}
              onSignOut={safeUnauthenticate}
            />
            {!user && (
              <Button text={'Sign in'} style={{ marginLeft: 20 }} onClick={() => safeAuthenticate()} small></Button>
            )}
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
      <ErrorHandler />
    </div>
  );
};

export default App;
