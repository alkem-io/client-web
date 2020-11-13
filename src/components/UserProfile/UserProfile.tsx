import React, { FC } from 'react';
import { useQuery } from '@apollo/client';
import { Col, Container, Form, Row } from 'react-bootstrap';
/*lib imports end*/

import UserFrom, { EditMode } from '../Admin/UserForm';
import Typography from '../core/Typography';
import { Loading } from '../core/Loading';
/*components imports end*/

import { QUERY_USER_PROFILE } from '../../graphql/user';
import { defaultUser } from '../../models/User';
import roles from '../../configs/roles.json';
import { createStyles } from '../../hooks/useTheme';
import { User, useUserProfileQuery } from '../../generated/graphql';
import clsx from 'clsx';
import Section, { Body, Header, SubHeader } from '../core/Section';
import Avatar from '../core/Avatar';
import Card from '../core/Card';
import Tag from '../core/Tag';
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
      {getMyRoles().map(r => (
        <Typography color={'background'} variant={'caption'} className={clsx(styles.role)}>
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

export const ContactDetails: FC<User | undefined> = ({ country, city, email, phone }) => {
  return (
    <Card primaryTextProps={{ text: 'Contact Details' }} bodyProps={{ classes: {} }}>
      <Detail title="Email" value={email} />
      <Detail title="Phone" value={phone} />
      <Detail title="Country" value={country} />
      <Detail title="City" value={city} />
    </Card>
  );
};

const useProfileStyles = createStyles(theme => ({
  roleContainer: {
    display: 'flex',
    gap: `${theme.shape.spacing(1)}px`,
  },
  listDetail: {
    padding: theme.shape.spacing(2),
    marginTop: theme.shape.spacing(1),
    backgroundColor: theme.palette.neutralLight,
    display: 'flex',
    alignItems: 'center',
  },
  noPadding: {
    padding: 0,
  },
}));

export const UserProfile: FC = () => {
  const styles = useProfileStyles();
  const { data, loading } = useQuery(QUERY_USER_PROFILE);

  const getListFromArray = arr => arr.length > 0 && arr.join(', ');
  const user = (data?.me as User) || defaultUser || {};

  const references = user?.profile?.references || [];
  const groups = user?.memberof?.groups.map(g => g.name) || [];
  const challenges = user?.memberof?.challenges.map(c => c.name) || [];

  const tags = user?.profile?.tagsets?.flatMap(x => x.tags);

  if (loading) return <Loading />;

  return (
    <Section avatar={<Avatar size="lg" src={user?.profile?.avatar} />} details={<ContactDetails {...user} />}>
      <Header text={user?.name} />
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
        {references?.map((x, i) => (
          <div key={i} className={styles.listDetail}>
            <div style={{ flexDirection: 'column' }}>
              <Typography variant="h4" as="span">
                {x.name}
              </Typography>
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
            <Typography variant="h4" as="span" className={styles.noPadding}>
              {x}
            </Typography>
            <div style={{ flexGrow: 1 }} />
            <Tag text="group" color="primary" />
          </div>
        ))}
        {challenges.map((x, i) => (
          <div key={i} className={styles.listDetail}>
            <Typography variant="h4" as="span" className={styles.noPadding}>
              {x}
            </Typography>
            <div style={{ flexGrow: 1 }} />
            <Tag text="challenge" color="neutral" />
          </div>
        ))}
      </Body>
    </Section>
    /* <Container className={'mt-5'}>
    //   <UserFrom user={data?.me || defaultUser} editMode={EditMode.readOnly} title={'My account info '} />
    //   <Row>
    //     <Form.Group as={Col}>
    //       <Form.Label>Groups</Form.Label>
    //       <Form.Control type={'text'} value={getListFromArray(groups)} readOnly={true} disabled={true} />
    //     </Form.Group>
    //   </Row>
    //   <Row>
    //     <Form.Group as={Col}>
    //       <Form.Label>Challenges</Form.Label>
    //       <Form.Control type={'text'} value={getListFromArray(challenges)} readOnly={true} disabled={true} />
    //     </Form.Group>
    //   </Row>
    //   <Typography variant={'h3'}>My Roles:</Typography>
    //   <UserRoles />
    // </Container> */
  );
};

export default UserProfile;
