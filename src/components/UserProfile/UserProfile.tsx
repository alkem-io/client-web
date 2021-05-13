import { ReactComponent as Edit } from 'bootstrap-icons/icons/pencil-square.svg';
import React, { FC } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { useTransactionScope } from '../../hooks/useSentry';
import { createStyles } from '../../hooks/useTheme';
import { useUserContext } from '../../hooks/useUserContext';
import { defaultUser } from '../../models/User';
import { AuthorizationCredential, User } from '../../types/graphql-schema';
import { toFirstCaptitalLetter } from '../../utils/toFirstCapitalLeter';
import Avatar from '../core/Avatar';
import Card from '../core/Card';
import { Loading } from '../core/Loading';
import Section, { Body, Header } from '../core/Section';
import Tag from '../core/Tag';
import Typography from '../core/Typography';

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
  },
  noPadding: {
    padding: 0,
  },
}));

export type MemberOfProps = {
  groups: string[];
  challenges: string[];
  opportunities: string[];
};

export const MemberOf: FC<MemberOfProps> = ({ groups, challenges, opportunities }) => {
  const styles = useMemberOfStyles();
  return (
    <Card primaryTextProps={{ text: 'Member of' }} className={'mt-2'}>
      {groups &&
        groups?.map((x, i) => (
          <div key={i} className={styles.listDetail}>
            <Typography as="span" className={styles.noPadding}>
              {x}
            </Typography>
            <div style={{ flexGrow: 1 }} />
            <Tag text="group" color="primary" />
          </div>
        ))}
      {challenges &&
        challenges.map((x, i) => (
          <div key={i} className={styles.listDetail}>
            <Typography as="span" className={styles.noPadding}>
              {x}
            </Typography>
            <div style={{ flexGrow: 1 }} />
            <Tag text="challenge" color="neutral" />
          </div>
        ))}
      {opportunities &&
        opportunities.map((x, i) => (
          <div key={i} className={styles.listDetail}>
            <Typography as="span" className={styles.noPadding}>
              {x}
            </Typography>
            <div style={{ flexGrow: 1 }} />
            <Tag text="opportunity" color="primary" />
          </div>
        ))}
    </Card>
  );
};

export const UserProfile: FC = () => {
  const history = useHistory();
  const styles = useMemberOfStyles();

  useTransactionScope({ type: 'authentication' });
  const { user: userMetadata, loading } = useUserContext();

  const user = (userMetadata?.user as User) || defaultUser || {};

  const references = user?.profile?.references || [];

  const groups =
    userMetadata?.roles.filter(r => r.type === AuthorizationCredential.UserGroupMember).map(r => r.name) || [];

  const challenges =
    userMetadata?.roles.filter(r => r.type === AuthorizationCredential.CommunityMember).map(r => r.resource) || [];
  const opportunities =
    userMetadata?.roles.filter(r => r.type === AuthorizationCredential.CommunityMember).map(r => r.resource) || [];

  const tagsets = user?.profile?.tagsets;
  const handleEditContactDetails = () => {
    history.push('/profile/edit');
  };

  if (loading) return <Loading text={'Loading User Profile ...'} />;

  return (
    <Section avatar={<Avatar size="lg" src={user?.profile?.avatar} />}>
      <Header text={user?.name}></Header>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Typography as="span" variant="caption">
          {userMetadata?.roles[0].name}
        </Typography>
      </div>
      <Body>
        <div style={{ marginTop: 20 }} />
        <ContactDetails user={user} onEdit={handleEditContactDetails} />
        <Card className={'mt-2'}>
          {tagsets &&
            tagsets.map((t, i) => (
              <div key={i}>
                <Typography as={'span'} color="primary" weight="boldLight" className={'mt-2'}>
                  {toFirstCaptitalLetter(t.name)}
                </Typography>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
                  {t.tags.map((x, i) => (
                    <Tag key={i} text={x} />
                  ))}
                </div>
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
        <MemberOf groups={groups} challenges={challenges} opportunities={opportunities} />
      </Body>
    </Section>
  );
};

export default UserProfile;
