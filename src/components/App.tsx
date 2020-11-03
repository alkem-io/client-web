import { AccountInfo } from '@azure/msal-browser';
import { ReactComponent as ChatFillIcon } from 'bootstrap-icons/icons/chat-fill.svg';
import { ReactComponent as ChatIcon } from 'bootstrap-icons/icons/chat.svg';
import { ReactComponent as CompassIcon } from 'bootstrap-icons/icons/compass.svg';
import { ReactComponent as FileEarmarkIcon } from 'bootstrap-icons/icons/file-earmark.svg';
import { ReactComponent as GlobeIcon } from 'bootstrap-icons/icons/globe2.svg';
import { ReactComponent as PeopleFillIcon } from 'bootstrap-icons/icons/people-fill.svg';
import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import { ReactComponent as ThreeDotsIcon } from 'bootstrap-icons/icons/three-dots.svg';
import React, { FC, useRef, useState } from 'react';
import { Overlay, Popover } from 'react-bootstrap';
import { useAuthenticationContext } from '../hooks/useAuthenticationContext';
import { createStyles } from '../hooks/useTheme';
import { useTypedSelector } from '../hooks/useTypedSelector';
import Button from './core/Button';
import Hidden from './core/Hidden';
import Icon from './core/Icon';
import IconButton from './core/IconButton';
import Section, { Body, Header as SectionHeader, SubHeader } from './core/Section';
import Typography from './core/Typography';
import { challenges, community, odyssey, projects } from './core/Typography.dummy.json';
import Footer from './layout/Footer';
import Header from './layout/Header';
import Main from './layout/Main';
import User from './layout/User';

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

interface NavigationSegmentProps {
  maximize: boolean;
}

const useNavigationStyles = createStyles(theme => ({
  navLinkOffset: {
    marginLeft: theme.shape.spacing(4),

    [theme.media.down('xl')]: {
      marginLeft: theme.shape.spacing(2),
    },
  },
  menuItem: {
    flexDirection: 'row',
    display: 'flex',
    width: 200,
    padding: theme.shape.spacing(1),

    '& > *': {
      marginRight: theme.shape.spacing(2),
    },
  },
}));

const NavigationSegment: FC<NavigationSegmentProps> = ({ maximize }) => {
  const styles = useNavigationStyles();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const popoverAnchor = useRef(null);

  return (
    <>
      <Hidden mdDown>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IconButton className={styles.navLinkOffset} onClick={() => alert('ecoverse')}>
            <Icon component={GlobeIcon} color="primary" size={maximize ? 'lg' : 'sm'} />
          </IconButton>
          <IconButton
            className={styles.navLinkOffset}
            onClick={() => alert('community')}
            hoverIcon={<Icon component={PeopleFillIcon} color="primary" size={maximize ? 'lg' : 'sm'} />}
          >
            <Icon component={PeopleIcon} color="primary" size={maximize ? 'lg' : 'sm'} />
          </IconButton>
          <IconButton
            className={styles.navLinkOffset}
            onClick={() => alert('community')}
            hoverIcon={<Icon component={ChatFillIcon} color="primary" size={maximize ? 'lg' : 'sm'} />}
          >
            <Icon component={ChatIcon} color="primary" size={maximize ? 'lg' : 'sm'} />
          </IconButton>
        </div>
      </Hidden>
      <Hidden mdUp>
        <div style={{ display: 'flex', alignItems: 'center' }} ref={popoverAnchor}>
          <IconButton className={styles.navLinkOffset} onClick={() => setDropdownOpen(x => !x)}>
            <Icon component={ThreeDotsIcon} color="primary" size={maximize ? 'lg' : 'sm'} />
          </IconButton>
        </div>
        <Overlay
          show={dropdownOpen}
          target={popoverAnchor}
          placement="bottom"
          container={popoverAnchor.current}
          containerPadding={20}
        >
          <Popover id="popover-contained">
            <Popover.Content>
              <div className={styles.menuItem}>
                <Icon component={GlobeIcon} color="primary" size="sm" />
                <Typography>Ecoverse</Typography>
              </div>
              <div className={styles.menuItem}>
                <Icon component={PeopleIcon} color="primary" size="sm" />
                <Typography>Community</Typography>
              </div>
              <div className={styles.menuItem}>
                <Icon component={ChatIcon} color="primary" size="sm" />
                <Typography>Messages</Typography>
              </div>
            </Popover.Content>
          </Popover>
        </Overlay>
      </Hidden>
    </>
  );
};

const App = (): React.ReactElement => {
  useGlobalStyles();
  const { context, isAuthenticated } = useAuthenticationContext();

  let page = <div>Restricted</div>;

  if (!context.authenticationEnabled || isAuthenticated) {
    page = <div>Unrestricted</div>;
  }

  return (
    <div id="app">
      <Header>
        {isVisible => (
          <div style={{ display: 'flex', flexGrow: 1, flexDirection: 'row' }}>
            <UserSegment orientation={isVisible ? 'vertical' : 'horizontal'} />
            <div style={{ display: 'flex', flexGrow: 1 }} />
            <NavigationSegment maximize={isVisible} />
          </div>
        )}
      </Header>
      <Main>
        <Section details={<div>Card Component - {page}</div>}>
          <SectionHeader text={odyssey.header} />
          <SubHeader text={odyssey.subheader} />
          <Body text={odyssey.body}>
            <Button text="Learn more" onClick={ev => console.log(ev)} />
          </Body>
        </Section>
        <Section avatar={<Icon component={CompassIcon} color="primary" size="xl" />}>
          <SectionHeader text={challenges.header} />
          <SubHeader text={challenges.subheader} />
          <Body text={challenges.body}></Body>
        </Section>
        <Section avatar={<Icon component={PeopleIcon} color="primary" size="xl" />}>
          <SectionHeader text={community.header} />
          <SubHeader text={community.subheader} />
          <Body text={community.body}>
            <Button text="Explore and connect" onClick={ev => console.log(ev)} />
          </Body>
        </Section>
        <Section avatar={<Icon component={FileEarmarkIcon} color="primary" size="xl" />}>
          <SectionHeader text={projects.header} tagText={projects.headerTag} />
          <SubHeader text={projects.subheader} />
        </Section>
      </Main>
      <Footer></Footer>
    </div>
  );
};

export default App;
