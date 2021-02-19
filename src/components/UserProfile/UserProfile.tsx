import { ReactComponent as Edit } from 'bootstrap-icons/icons/pencil-square.svg';
import clsx from 'clsx';
import React, { FC } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import roles from '../../configs/roles.json';
import { User, useUserProfileQuery } from '../../generated/graphql';
/*components imports end*/
import { useTransactionScope } from '../../hooks/useSentry';
import { createStyles } from '../../hooks/useTheme';
import { defaultUser } from '../../models/User';
import { toFirstCaptitalLetter } from '../../utils/toFirstCapitalLeter';
import Avatar from '../core/Avatar';
import Card from '../core/Card';
import { Loading } from '../core/Loading';
import Section, { Body, Header } from '../core/Section';
import Tag from '../core/Tag';
import Typography from '../core/Typography';

/*local files imports end*/

const useUserRoleStyles = createStyles(theme => ({
  roleContainer: {
    display: 'flex',
    gap: `${theme.shape.spacing(1)}px`,
  },
  role: {
    padding: '5px 10px',
    backgroundColor: theme.palette.primary,
    borderRadius: theme.shape.spacing(2),
  },
}));

export const UserRoles: FC = () => {
  const styles = useUserRoleStyles();
  const { data } = useUserProfileQuery();

  const groups = data?.me?.memberof?.groups.map(g => g.name) || [];

  const getMyRoles = () => {
    const specialRoles = roles['groups-roles'].filter(r => groups.includes(r.group));
    return specialRoles.length > 0 ? specialRoles.map(r => r.role) : [roles['default-role']];
  };

  return (
    <div className={styles.roleContainer}>
      {getMyRoles().map((r, i) => (
        <Typography key={i} color={'background'} variant={'caption'} className={clsx(styles.role)}>
          {r}
        </Typography>
      ))}
    </div>
  );
};

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
      {groups.map((x, i) => (
        <div key={i} className={styles.listDetail}>
          <Typography as="span" className={styles.noPadding}>
            {x}
          </Typography>
          <div style={{ flexGrow: 1 }} />
          <Tag text="group" color="primary" />
        </div>
      ))}
      {challenges.map((x, i) => (
        <div key={i} className={styles.listDetail}>
          <Typography as="span" className={styles.noPadding}>
            {x}
          </Typography>
          <div style={{ flexGrow: 1 }} />
          <Tag text="challenge" color="neutral" />
        </div>
      ))}
      {opportunities.map((x, i) => (
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
  const { data, loading } = useUserProfileQuery();

  const user = (data?.me as User) || defaultUser || {};

  const references = user?.profile?.references || [];
  const groups = user?.memberof?.groups.map(g => g.name) || [];
  const challenges = user?.memberof?.challenges.map(c => c.name) || [];
  const opportunities = user?.memberof?.opportunities.map(c => c.name) || [];

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
          Roles
        </Typography>
        <UserRoles />
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
