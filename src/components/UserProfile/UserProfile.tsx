import clsx from 'clsx';
import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';
import roles from '../../configs/roles.json';
import { Reference, User, useUserProfileQuery } from '../../generated/graphql';
/*components imports end*/
import { useTransactionScope } from '../../hooks/useSentry';
import { createStyles } from '../../hooks/useTheme';
import { defaultUser } from '../../models/User';
import Avatar from '../core/Avatar';
import Button from '../core/Button';
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
      <Typography color="primary" weight="boldLight">
        {title}
      </Typography>
      <Typography>{value}</Typography>{' '}
    </>
  ) : (
    <></>
  );
};

export const ContactDetails: FC<{ user: User; onEdit?: () => void }> = ({ user: { country, city, email, phone } }) => {
  return (
    <>
      <Card bodyProps={{ classes: {} }}>
        <Detail title="Email" value={email} />
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
  references?: Reference[];
  groups: string[];
  challenges: string[];
};

export const MemberOf: FC<MemberOfProps> = ({ references, groups, challenges }) => {
  const styles = useMemberOfStyles();

  return (
    <>
      {references?.map((x, i) => (
        <div key={i} className={styles.listDetail}>
          <div style={{ flexDirection: 'column' }}>
            <Typography as="span">{x.name}</Typography>
            <Typography variant="caption" color="neutralMedium">
              {x.description ? x.description : <i>No description provided</i>}
            </Typography>
          </div>
          <div style={{ flexGrow: 1 }} />
          <Tag text="references" color="positive" />
        </div>
      ))}
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
    </>
  );
};

export const UserProfile: FC = () => {
  const history = useHistory();

  useTransactionScope({ type: 'authentication' });
  const { data, loading } = useUserProfileQuery();

  const user = (data?.me as User) || defaultUser || {};

  const references = user?.profile?.references || [];
  const groups = user?.memberof?.groups.map(g => g.name) || [];
  const challenges = user?.memberof?.challenges.map(c => c.name) || [];

  const tags = user?.profile?.tagsets?.flatMap(x => x.tags);

  const handleEditContactDetails = () => {
    history.push('/profile/edit');
  };

  if (loading) return <Loading text={'Loading User Profile ...'} />;

  return (
    <Section
      avatar={<Avatar size="lg" src={user?.profile?.avatar} />}
      details={<MemberOf references={references} groups={groups} challenges={challenges} />}
    >
      <Header text={user?.name}></Header>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Typography as="span" variant="caption">
          Roles
        </Typography>
        <UserRoles />
      </div>
      {tags && tags.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
          <Typography as="span" variant="caption">
            Skills
          </Typography>
          {tags.map((x, i) => (
            <Tag key={i} text={x} />
          ))}
        </div>
      )}
      <Body text={user?.profile?.description}>
        <div style={{ marginTop: 20 }} />
        <Button variant={'primary'} small onClick={handleEditContactDetails}>
          Edit
        </Button>
        <ContactDetails user={user} onEdit={handleEditContactDetails} />
      </Body>
    </Section>
  );
};

export default UserProfile;
