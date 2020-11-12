import React from 'react';
import { useQuery } from '@apollo/client';
/*lib imports end*/

import UserFrom, { EditMode } from '../Admin/UserForm';
/*components imports end*/

import { QUERY_USER_PROFILE } from '../../graphql/user';
import { defaultUser } from '../../models/User';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { Loading } from '../core/Loading';
import { useTransactionScope } from '../../hooks/useSentry';
/*local files imports end*/

export const UserProfile = () => {
  useTransactionScope({ type: 'authentication' });
  const { data, loading } = useQuery(QUERY_USER_PROFILE);

  const groups = data?.me?.memberof?.groups.map(g => g.name).join(', ') || '';
  const challenges = data?.me?.memberof?.challenges.map(c => c.name).join(', ') || '';

  if (loading) return <Loading />;

  return (
    <Container className={'mt-5'}>
      <UserFrom user={data?.me || defaultUser} editMode={EditMode.readOnly} title={'My profile'} />
      <Row>
        <Form.Group as={Col}>
          <Form.Label>Groups</Form.Label>
          <Form.Control type={'text'} value={groups} readOnly={true} disabled={true} />
        </Form.Group>
      </Row>
      <Row>
        <Form.Group as={Col}>
          <Form.Label>Challenges</Form.Label>
          <Form.Control type={'text'} value={challenges} readOnly={true} disabled={true} />
        </Form.Group>
      </Row>
    </Container>
  );
};

export default UserProfile;
