import { ReactComponent as ChevronUpIcon } from 'bootstrap-icons/icons/chevron-up.svg';
import React, { FC, useRef } from 'react';
import { ErrorHandler } from '../containers/ErrorHandler';
import { UserMetadata } from '../context/UserProvider';
import { useAuthenticate } from '../hooks/useAuthenticate';
import { useNavigation } from '../hooks/useNavigation';
import { useUserScope } from '../hooks/useSentry';
import { useUserContext } from '../hooks/useUserContext';
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
import { useServerMetadataQuery } from '../generated/graphql';

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
  const { safeAuthenticate, safeUnauthenticate } = useAuthenticate();
  const { user, loading } = useUserContext();
  const { paths } = useNavigation();
  const headerRef = useRef<HTMLElement>(null);
  useUserScope(user);

  const { data } = useServerMetadataQuery({
    onCompleted: () => {
      console.table({
        clientName: process.env.REACT_APP_NAME,
        clientVersion: process.env.REACT_APP_VERSION,
        serverName: data?.metadata.services[0].name,
        serverVersion: data?.metadata.services[0].version,
        cherrytwistDomain: process.env.REACT_APP_FEEDBACK_URL,
      });
    },
  });

  if (loading) {
    return <Loading text={'Loading Application ...'} />;
  }

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
            {!user && <Button text={'Sign in'} style={{ marginLeft: 20 }} onClick={() => safeAuthenticate()} small />}
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
