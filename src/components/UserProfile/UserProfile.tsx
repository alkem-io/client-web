import React, { FC } from 'react';
import { Alert } from 'react-bootstrap';
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
import { Loading } from '../core/Loading';
import Section, { Body, Header } from '../core/Section';
import Tag from '../core/Tag';
import Typography from '../core/Typography';
import TagContainer from '../core/TagContainer';
import MemberOf from './MemberOf';
import ContactDetails from './ContactDetails';
import { createStyles } from '../../hooks/useTheme';
import PendingApplications from './PendingApplications';

const useStyles = createStyles(theme => ({
  listDetail: {
    padding: theme.shape.spacing(1),
    marginTop: theme.shape.spacing(1),
    backgroundColor: theme.palette.neutralLight,
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
        <Alert show={!verified} variant={'warning'}>
          <Trans
            i18nKey={'pages.user-profile.email-not-verified'}
            components={{
              l: <Link to={AUTH_VERIFY_PATH} />,
            }}
          />
        </Alert>
        <ContactDetails user={user} onEdit={handleEditContactDetails} />
        <PendingApplications user={user} />
        <Card className={'mt-2'}>
          {tagsets &&
            tagsets.map((t, i) => (
              <div key={i}>
                <Typography as={'span'} color="primary" weight="boldLight" className={'mt-2'}>
                  {toFirstCaptitalLetter(t.name)}
                </Typography>
                <TagContainer>
                  {t.tags.map((t, i) => (
                    <Tag key={i} text={t} color="neutralMedium" />
                  ))}
                </TagContainer>
              </div>
            ))}
        </Card>
        <Card primaryTextProps={{ text: 'References' }} className={'mt-2'}>
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
