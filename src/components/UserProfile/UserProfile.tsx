import React, { FC } from 'react';
import { Trans } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';
import { useTransactionScope } from '../../hooks';
import { useUserContext } from '../../hooks';
import { AUTH_VERIFY_PATH } from '../../models/constants';
import { defaultUser } from '../../models/User';
import { User } from '../../models/graphql-schema';
import { toFirstCaptitalLetter } from '../../utils/toFirstCapitalLeter';
import Avatar from '../core/Avatar';
import Card from '../core/Card';
import { Loading } from '../core';
import Section, { Body, Header } from '../core/Section';
import Tag from '../core/Tag';
import Typography from '../core/Typography';
import TagContainer from '../core/TagContainer';
import MemberOf from './MemberOf';
import ContactDetails from './ContactDetails';
import { createStyles } from '../../hooks/useTheme';
import PendingApplications from './PendingApplications';
import Alert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import { Box } from '@material-ui/core';

const useStyles = createStyles(theme => ({
  listDetail: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(1),
    backgroundColor: theme.palette.neutralLight.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));

export const UserProfile: FC = () => {
  const history = useHistory();
  const styles = useStyles();

  useTransactionScope({ type: 'authentication' });
  const { user: userMetadata, loading, verified } = useUserContext();

  const user = (userMetadata?.user as User) || defaultUser || {};

  const references = user?.profile?.references || [];

  const { groups = [], challenges = [], opportunities = [], ecoverses = [], organizations = [] } = userMetadata || {};

  const tagsets = user?.profile?.tagsets;
  const handleEditContactDetails = () => {
    history.push('/profile/edit');
  };

  if (loading) return <Loading text={'Loading User Profile ...'} />;

  return (
    <Section avatar={<Avatar size="lg" src={user?.profile?.avatar} />}>
      <Header text={user?.displayName} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Typography as="span" variant="caption">
          {userMetadata?.roles[0].name}
        </Typography>
      </div>
      <Body>
        <div style={{ marginTop: 20 }} />
        <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} open={!verified}>
          <Alert severity={'warning'}>
            <Trans
              i18nKey={'pages.user-profile.email-not-verified'}
              components={{
                l: <Link to={AUTH_VERIFY_PATH} />,
              }}
            />
          </Alert>
        </Snackbar>
        <ContactDetails user={user} onEdit={handleEditContactDetails} />
        <PendingApplications user={user} />
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

export default UserProfile;
