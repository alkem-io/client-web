import { ReactComponent as ChevronUpIcon } from 'bootstrap-icons/icons/chevron-up.svg';
import React, { FC, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { NotificationHandler } from '../containers/NotificationHandler';
import { useServerMetadataQuery } from '../generated/graphql';
import { useAuthenticationContext } from '../hooks/useAuthenticationContext';
import { useConfig } from '../hooks/useConfig';
import { useNavigation } from '../hooks/useNavigation';
import { useUserScope } from '../hooks/useSentry';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { useUserContext } from '../hooks/useUserContext';
import { UserMetadata } from '../hooks/useUserMetadataWrapper';
import { AUTH_LOGIN_PATH, AUTH_REGISTER_PATH } from '../models/Constants';
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
import Sidebar from './layout/Sidebar/Sidebar';
import User from './layout/User';
import { useEcoversesContext } from '../hooks/useEcoversesContext';

interface UserSegmentProps {
  orientation: 'vertical' | 'horizontal';
  userMetadata: UserMetadata;
}

const UserSegment: FC<UserSegmentProps> = ({ orientation, userMetadata }) => {
  const { user, roles } = userMetadata;
  const role = roles[0]?.name || 'Registered';
  return user && <User name={user.displayName} title={role} orientation={orientation} src={user.profile?.avatar} />;
};

const App = ({ children }): React.ReactElement => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthenticationContext();
  const { ecoverses } = useEcoversesContext();

  const { user, loading } = useUserContext();
  const { loading: configLoading } = useConfig();
  const loginVisible = useTypedSelector(x => x.ui.loginNavigation.visible);
  const { paths } = useNavigation();
  const headerRef = useRef<HTMLElement>(null);
  const isUserSegmentVisible = useTypedSelector<boolean>(state => state.ui.userSegment.visible);
  useUserScope(user);

  const { data } = useServerMetadataQuery({
    onCompleted: () => {
      console.table({
        clientName: process.env.REACT_APP_NAME,
        clientVersion: process.env.REACT_APP_VERSION,
        serverName: data?.metadata.services[0].name,
        serverVersion: data?.metadata.services[0].version,
        feedback: process.env.REACT_APP_FEEDBACK_URL,
        buildVersion: process.env.REACT_APP_BUILD_VERSION,
        buildDate: process.env.REACT_APP_BUILD_DATE,
        buildRevision: process.env.REACT_APP_BUILD_REVISION,
      });
    },
  });

  if (loading || configLoading) {
    return <Loading text={'Loading Application ...'} />;
  }

  return (
    <div id="app">
      <Header innerRef={headerRef}>
        {isVisible => (
          <div style={{ display: 'flex', flexGrow: 1, flexDirection: 'row', alignItems: 'center' }}>
            {isUserSegmentVisible && user && (
              <UserSegment userMetadata={user} orientation={isVisible ? 'vertical' : 'horizontal'} />
            )}
            <div style={{ display: 'flex', flexGrow: 1 }} />
            <Navigation maximize={isVisible} userMetadata={user} />
            {loginVisible && (
              <>
                {!isAuthenticated && (
                  <Button
                    as={Link}
                    to={AUTH_LOGIN_PATH}
                    text={t('authentication.sign-in')}
                    style={{ marginLeft: 20 }}
                    small
                  />
                )}
                {!isAuthenticated && (
                  <Button
                    as={Link}
                    to={AUTH_REGISTER_PATH}
                    text={t('authentication.sign-up')}
                    style={{ marginLeft: 20 }}
                    small
                  />
                )}
              </>
            )}
          </div>
        )}
      </Header>
      <Sidebar isUserAuth={Boolean(user)} ecoverses={ecoverses} />
      <div id="main">
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
      </div>
      <Footer>
        <IconButton onClick={() => headerRef.current?.scrollIntoView({ behavior: 'smooth' })}>
          <Icon component={ChevronUpIcon} color="inherit" size={'lg'} />
        </IconButton>
      </Footer>
      <NotificationHandler />
    </div>
  );
};

export default App;
