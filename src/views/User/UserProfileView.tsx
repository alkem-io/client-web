import { Box, Grid, Icon, makeStyles } from '@material-ui/core';
import { LocationOn } from '@material-ui/icons';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router-dom';
import { SettingsButton } from '../../components/composite';
import VerifiedStatus from '../../components/composite/common/VerifiedStatus/VerifiedStatus';
import Avatar from '../../components/core/Avatar';
import Card from '../../components/core/Card';
import Section, { Body, Header } from '../../components/core/Section';
import Tag from '../../components/core/Tag';
import TagContainer from '../../components/core/TagContainer';
import Typography from '../../components/core/Typography';
import ContactDetails from '../../components/UserProfile/ContactDetails';
import MemberOf from '../../components/UserProfile/MemberOf';
import PendingApplicationsView from '../PendingApplications/PendingApplicationsView';
import { UserMetadata } from '../../hooks';
import { AUTH_VERIFY_PATH, COUNTRIES } from '../../models/constants';
import { toFirstCaptitalLetter } from '../../utils/toFirstCapitalLeter';
import PendingApplicationsContainer from '../../containers/applications/PendingApplicationsContainer';

export interface UserProfileViewProps {
  entities: {
    userMetadata: UserMetadata;
    verified: boolean;
  };
  options?: {
    isCurrentUser?: boolean;
  };
}

const useUserProfileViewStyles = makeStyles(theme => ({
  listDetail: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(1),
    backgroundColor: theme.palette.neutralLight.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));

const defaultOptions: UserProfileViewProps['options'] = {
  isCurrentUser: false,
};

export const UserProfileView: FC<UserProfileViewProps> = ({ entities: { userMetadata, verified }, options }) => {
  const { url } = useRouteMatch();
  const { t } = useTranslation();
  const { user } = userMetadata;
  const styles = useUserProfileViewStyles();
  const tagsets = user.profile?.tagsets;
  const references = user.profile?.references;
  const { groups = [], challenges = [], opportunities = [], ecoverses = [], organizations = [] } = userMetadata || {};
  const { isCurrentUser } = { ...defaultOptions, ...options };

  return (
    <Section avatar={<Avatar size="lg" src={user?.profile?.avatar} />}>
      <Header
        text={user.displayName}
        editComponent={
          isCurrentUser && (
            <SettingsButton color={'primary'} to={`${url}/edit`} tooltip={t('pages.user-profile.tooltips.settings')} />
          )
        }
      />
      <Grid item container spacing={2} alignItems={'baseline'}>
        {user.country && (
          <Grid item>
            <Typography variant="caption">
              <Icon>
                <LocationOn />
              </Icon>
              {COUNTRIES.find(x => x.code === user.country)?.name}
            </Typography>
          </Grid>
        )}
        <Grid item>
          <Typography variant="caption">{userMetadata?.roles[0] && userMetadata?.roles[0].name}</Typography>
        </Grid>
        {isCurrentUser && (
          <Grid item>
            <VerifiedStatus verified={verified} to={verified ? undefined : AUTH_VERIFY_PATH} />
          </Grid>
        )}
      </Grid>
      <Body>
        <ContactDetails user={user} />
        <PendingApplicationsContainer entities={{ userId: user.id }}>
          {(entities, actions, state) => (
            <PendingApplicationsView
              entities={entities}
              actions={actions}
              state={state}
              options={{ canEdit: isCurrentUser || false }}
            />
          )}
        </PendingApplicationsContainer>
        <Box marginY={1}>
          <Card>
            {tagsets &&
              tagsets.map((t, i) => (
                <Box key={i} marginY={1}>
                  <Typography as={'span'} color="primary" weight="boldLight">
                    {toFirstCaptitalLetter(t.name)}
                  </Typography>
                  <TagContainer>
                    {t.tags.map((t, i) => (
                      <Tag key={i} text={t} color="neutralMedium" />
                    ))}
                  </TagContainer>
                </Box>
              ))}
          </Card>
        </Box>
        <Box marginY={1}>
          <Card primaryTextProps={{ text: 'References' }}>
            {references?.map((x, i) => (
              <div key={i} className={styles.listDetail}>
                <div style={{ flexDirection: 'column' }}>
                  <Typography as="a" href={x.uri} target={'_blank'}>
                    {x.name}
                  </Typography>
                  <Typography variant="caption" color="neutralMedium">
                    {x.uri}
                  </Typography>
                </div>
                <div style={{ flexGrow: 1 }} />
              </div>
            ))}
          </Card>
        </Box>
        <MemberOf
          groups={groups}
          challenges={challenges}
          opportunities={opportunities}
          ecoverses={ecoverses}
          organizations={organizations}
        />
      </Body>
    </Section>
  );
};
export default UserProfileView;
