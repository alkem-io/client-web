import { ReactComponent as Edit } from 'bootstrap-icons/icons/pencil-square.svg';
import React, { FC } from 'react';
import { Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';
import { useTransactionScope } from '../../hooks/useSentry';
import { createStyles } from '../../hooks/useTheme';
import { useUserContext } from '../../hooks/useUserContext';
import { VERIFY_PATH } from '../../models/Constants';
import { defaultUser } from '../../models/User';
import { User } from '../../types/graphql-schema';
import { toFirstCaptitalLetter } from '../../utils/toFirstCapitalLeter';
import Avatar from '../core/Avatar';
import Card from '../core/Card';
import { Loading } from '../core/Loading';
import Section, { Body, Header } from '../core/Section';
import Tag, { TagProps } from '../core/Tag';
import Typography from '../core/Typography';
import TagContainer from '../core/TagContainer';

const Detail: FC<{ title: string; value: string }> = ({ title, value }) => {
  return value ? (
    <>
      <Typography color="primary" weight="boldLight" className={'mt-2'}>
        {title}
      </Typography>
      <Typography>{value}</Typography>{' '}
    </>
  ) : (
    <></>
  );
};

const useContactDetailsStyles = createStyles(_theme => ({
  edit: {
    fill: _theme.palette.neutral,
    '&:hover': {
      cursor: 'pointer',
    },
  },
}));

export const ContactDetails: FC<{ user: User; onEdit?: () => void }> = ({
  user: { country, city, email, phone, profile },
  onEdit,
}) => {
  const styles = useContactDetailsStyles();
  return (
    <>
      <Card bodyProps={{ classes: {} }}>
        <div className={'d-flex align-items-end flex-column'}>
          <OverlayTrigger placement={'bottom'} overlay={<Tooltip id={'Edit profile'}>Edit profile</Tooltip>}>
            <Edit color={'white'} width={20} height={20} className={styles.edit} onClick={onEdit} />
          </OverlayTrigger>
        </div>
        <Detail title="Email" value={email} />
        <Detail title="Bio" value={profile?.description || ''} />
        <Detail title="Phone" value={phone} />
        <Detail title="Country" value={country} />
        <Detail title="City" value={city} />
      </Card>
    </>
  );
};

const useMemberOfStyles = createStyles(theme => ({
  listDetail: {
    padding: theme.shape.spacing(1),
    marginTop: theme.shape.spacing(1),
    backgroundColor: theme.palette.neutralLight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noPadding: {
    padding: 0,
  },
}));

export type MemberOfProps = {
  groups: string[];
  challenges: string[];
  opportunities: string[];
  ecoverses: string[];
  organizations: string[];
};

export const MemberOf: FC<MemberOfProps> = ({ groups, challenges, opportunities, ecoverses, organizations }) => {
  const { t } = useTranslation();
  const styles = useMemberOfStyles();

  const membershipItems = (names: string[], tagText: string, tagColor: TagProps['color']) => {
    return (
      names &&
      names.map((x, i) => (
        <div key={i} className={styles.listDetail}>
          <Typography as="span" className={styles.noPadding}>
            {x}
          </Typography>
          <Tag text={tagText} color={tagColor} />
        </div>
      ))
    );
  };

  return (
    <Card primaryTextProps={{ text: 'Member of' }} className={'mt-2'}>
      {membershipItems(ecoverses, t('general.ecoverse'), 'primary')}
      {membershipItems(groups, t('general.group'), 'primary')}
      {membershipItems(challenges, t('general.challenge'), 'neutral')}
      {membershipItems(opportunities, t('general.opportunity'), 'primary')}
      {membershipItems(organizations, t('general.organization'), 'positive')}
    </Card>
  );
};

export const UserProfile: FC = () => {
  const history = useHistory();
  const styles = useMemberOfStyles();

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
              l: <Link to={VERIFY_PATH} />,
            }}
          />
        </Alert>
        <ContactDetails user={user} onEdit={handleEditContactDetails} />
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
