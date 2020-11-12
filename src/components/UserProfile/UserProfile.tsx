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
import { useUserProfileQuery } from '../../generated/graphql';
import clsx from 'clsx';
import { useTransactionScope } from '../../hooks/useSentry';
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

export const UserProfile: FC = () => {
  useTransactionScope({ type: 'authentication' });
  const { data, loading } = useQuery(QUERY_USER_PROFILE);

  const groups = data?.me?.memberof?.groups.map(g => g.name) || [];
  const challenges = data?.me?.memberof?.challenges.map(c => c.name) || [];

  const getListFromArray = arr => arr.length > 0 && arr.join(', ');

  if (loading) return <Loading />;

  return (
    <Container className={'mt-5'}>
      <UserFrom user={data?.me || defaultUser} editMode={EditMode.readOnly} title={'My account info '} />
      <Row>
        <Form.Group as={Col}>
          <Form.Label>Groups</Form.Label>
          <Form.Control type={'text'} value={getListFromArray(groups)} readOnly={true} disabled={true} />
        </Form.Group>
      </Row>
      <Row>
        <Form.Group as={Col}>
          <Form.Label>Challenges</Form.Label>
          <Form.Control type={'text'} value={getListFromArray(challenges)} readOnly={true} disabled={true} />
        </Form.Group>
      </Row>
      <Typography variant={'h3'}>My Roles:</Typography>
      <UserRoles />
    </Container>
  );
};

export default UserProfile;
